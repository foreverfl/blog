"use server";

import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// 환경 변수에서 URI 가져오기
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// DB 연결하기
export async function connectDB() {
  try {
    await client.connect();
    await client.db("blog").command({ ping: 1 });
    return client.db("blog");
  } finally {
    // await client.close();
  }
}

// Category and Classification CRUD
interface Classification {
  _id: string;
  name_ko: string;
  name_ja: string;
}

interface Category {
  _id: string;
  classification: string;
  name_ko: string;
  name_ja: string;
}

export async function getClassificationsAndCategories(): Promise<{
  classifications: Classification[];
  categories: Category[];
}> {
  const db = await connectDB();

  const classifications = await db
    .collection("classifications")
    .find({})
    .toArray();
  const categories = await db.collection("categories").find({}).toArray();

  // _id를 문자열로 변환
  const classificationsFormatted = classifications.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    name_ko: doc.name_ko,
    name_ja: doc.name_ja,
  }));
  const categoriesFormatted = categories.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    classification: doc.classification.toString(),
    name_ko: doc.name_ko,
    name_ja: doc.name_ja,
  }));

  return {
    classifications: classificationsFormatted,
    categories: categoriesFormatted,
  };
}

// Classification CRUD
export async function addClassification(name_ko: string, name_ja: string) {
  const db = await connectDB();
  const classifications = db.collection("classifications");

  // 현재 최대 index 값을 찾음
  const maxIndexDocument = await classifications
    .find()
    .sort({ index: -1 })
    .limit(1)
    .toArray();
  let currentIndex = 1;
  if (maxIndexDocument.length > 0) {
    currentIndex = maxIndexDocument[0].index + 1;
  }

  const result = await db.collection("classifications").insertOne({
    index: currentIndex,
    name_ko,
    name_ja,
  });
  return result.insertedId.toString();
}

export async function updateClassification(
  classificationId: string,
  name_ko: string,
  name_ja: string
) {
  const db = await connectDB();

  const result = await db.collection("classifications").updateOne(
    { _id: new ObjectId(classificationId) },
    // $set 연산자: 문서 내의 특정 필드의 값을 수정하거나, 해당 필드가 없다면 새로 추가
    { $set: { name_ko, name_ja } }
  );
  return result.modifiedCount;
}

export async function deleteClassification(classificationId: string) {
  const db = await connectDB();

  // classification 삭제
  const classificationDeleteResult = await db
    .collection("classifications")
    .deleteOne({ _id: new ObjectId(classificationId) });

  if (classificationDeleteResult.deletedCount > 0) {
    // 해당 classification을 참조하는 categories 찾기
    const categories = await db
      .collection("categories")
      .find({ classification: new ObjectId(classificationId) })
      .toArray();
    const categoryIds = categories.map((category) => category._id);

    // 찾은 categories 삭제
    await db.collection("categories").deleteMany({ _id: { $in: categoryIds } });

    // 각 category에 속한 posts 찾기 및 삭제
    const posts = await db
      .collection("posts")
      .find({ category: { $in: categoryIds } })
      .toArray();
    const postIds = posts.map((post) => post._id);
    await db.collection("posts").deleteMany({ _id: { $in: postIds } });

    // 각 post에 속한 comments 삭제
    await db.collection("comments").deleteMany({ post: { $in: postIds } });
  }

  return classificationDeleteResult.deletedCount;
}

// Category CRUD
export async function addCategory(
  classificationId: string,
  name_ko: string,
  name_ja: string
) {
  const db = await connectDB();
  const categories = db.collection("categories");

  // 현재 최대 index 값을 찾음
  const maxIndexDocument = await categories
    .find()
    .sort({ index: -1 })
    .limit(1)
    .toArray();
  let currentIndex = 1;
  if (maxIndexDocument.length > 0) {
    currentIndex = maxIndexDocument[0].index + 1;
  }

  // category 추가
  const category = {
    classification: new ObjectId(classificationId),
    index: currentIndex,
    name_ko,
    name_ja,
  };
  const result = await db.collection("categories").insertOne(category);

  return result.insertedId.toString();
}

export async function updateCategory(
  categoryId: string,
  name_ko: string,
  name_ja: string
) {
  const db = await connectDB();
  const result = await db
    .collection("categories")
    .updateOne(
      { _id: new ObjectId(categoryId) },
      { $set: { name_ko, name_ja } }
    );
  return result.modifiedCount;
}

export async function deleteCategory(categoryId: string) {
  const db = await connectDB();

  // category 삭제
  const categoryDeleteResult = await db
    .collection("categories")
    .deleteOne({ _id: new ObjectId(categoryId) });

  if (categoryDeleteResult.deletedCount > 0) {
    // 해당 category에 속한 posts 찾기
    const posts = await db
      .collection("posts")
      .find({ category: new ObjectId(categoryId) })
      .toArray();

    const postIds = posts.map((post) => post._id);

    // 찾은 posts 삭제
    await db.collection("posts").deleteMany({ _id: { $in: postIds } });

    // 각 post에 속한 comments 삭제
    await db.collection("comments").deleteMany({ post: { $in: postIds } });
  }

  return categoryDeleteResult.deletedCount;
}

// Post CRUD
interface Post {
  _id: string;
  index: number;
  category: string;
  title_ko: string;
  title_ja: string;
  content_ko: string;
  content_ja: string;
  like: number;
  createdAt: string; // ISO 문자열 형태로 변환
}

export async function addPost(
  categoryId: string,
  title_ko: string,
  title_ja: string,
  content_ko: string,
  content_ja: string
) {
  const db = await connectDB();
  const posts = db.collection("posts");

  // 현재 최대 index 값을 찾음
  const maxIndexDocument = await posts
    .find()
    .sort({ index: -1 })
    .limit(1)
    .toArray();
  let currentIndex = 1;
  if (maxIndexDocument.length > 0) {
    currentIndex = maxIndexDocument[0].index + 1;
  }

  const createdAt = new Date();
  const post = {
    category: new ObjectId(categoryId),
    index: currentIndex,
    title_ko,
    title_ja,
    content_ko,
    content_ja,
    like: 0,
    createdAt,
  };
  const result = await db.collection("posts").insertOne(post);
  return result.insertedId.toString();
}

export async function getPosts(): Promise<Post[]> {
  const db = await connectDB();
  const posts = await db.collection("posts").find({}).toArray();
  const postsFormatted: Post[] = posts.map((doc) => ({
    _id: doc._id.toString(),
    index: doc.index,
    category: doc.category.toString(),
    title_ko: doc.title_ko,
    title_ja: doc.title_ja,
    content_ko: doc.content_ko,
    content_ja: doc.content_ja,
    like: doc.like,
    createdAt: doc.createdAt.toISOString(),
  }));
  return postsFormatted;
}

export async function getPostsByCategory(categoryId: string): Promise<Post[]> {
  const db = await connectDB();
  const posts = await db
    .collection("posts")
    .find({ category: new ObjectId(categoryId) })
    .toArray();
  const postsFormatted: Post[] = posts.map((doc) => ({
    _id: doc._id.toString(),
    index: doc.index,
    category: doc.category.toString(),
    title_ko: doc.title_ko,
    title_ja: doc.title_ja,
    content_ko: doc.content_ko,
    content_ja: doc.content_ja,
    like: doc.like,
    createdAt: doc.createdAt.toISOString(),
  }));

  return postsFormatted;
}

export async function getPostByIndex(index: number): Promise<Post | null> {
  const db = await connectDB();
  const post = await db.collection("posts").findOne({ index: index });

  if (!post) {
    return null; // 조건에 맞는 포스트가 없는 경우
  }

  const postFormatted: Post = {
    _id: post._id.toString(),
    category: post.category.toString(),
    index: post.index,
    title_ko: post.title_ko,
    title_ja: post.title_ja,
    content_ko: post.content_ko,
    content_ja: post.content_ja,
    like: post.like,
    createdAt: post.createdAt.toISOString(),
  };

  return postFormatted;
}

export async function updatePost(
  postId: string,
  title_ko: string,
  title_ja: string,
  content_ko: string,
  content_ja: string
) {
  const db = await connectDB();

  const classifications = db.collection("classifications");

  // 현재 최대 index 값을 찾음
  const maxIndexDocument = await classifications
    .find()
    .sort({ index: -1 })
    .limit(1)
    .toArray();
  let currentIndex = 1;
  if (maxIndexDocument.length > 0) {
    currentIndex = maxIndexDocument[0].index + 1;
  }

  const result = await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        title_ko,
        title_ja,
        content_ko,
        content_ja,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount;
}

export async function deletePost(postId: string) {
  const db = await connectDB();
  const result = await db
    .collection("posts")
    .deleteOne({ _id: new ObjectId(postId) });
  if (result.deletedCount > 0) {
    await db.collection("comments").deleteMany({ post: new ObjectId(postId) });
  }
  return result.deletedCount;
}

// Comment CRUD
export async function addComment(
  postId: string,
  userId: string,
  content: string,
  lan: string
) {
  const db = await connectDB();

  const comments = db.collection("comments");

  // 현재 최대 index 값을 찾음
  const maxIndexDocument = await comments
    .find()
    .sort({ index: -1 })
    .limit(1)
    .toArray();
  let currentIndex = 1;
  if (maxIndexDocument.length > 0) {
    currentIndex = maxIndexDocument[0].index + 1;
  }

  const createdAt = new Date();
  const comment = {
    userId: new ObjectId(userId),
    index: currentIndex,
    post: new ObjectId(postId),
    content,
    lan,
    createdAt,
    isAnswered: false,
  };
  const result = await db.collection("comments").insertOne(comment);
  return result.insertedId;
}

export async function getCommentsByPost(postId: string) {
  const db = await connectDB();
  const comments = await db
    .collection("comments")
    .find({ post: new ObjectId(postId) })
    .toArray();
  return comments;
}

export async function updateComment(
  commentId: string,
  content: string,
  isAnswered: boolean
) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { content, isAnswered } }
    );
  return result.modifiedCount;
}

export async function deleteComment(commentId: string) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .deleteOne({ _id: new ObjectId(commentId) });
  return result.deletedCount;
}
