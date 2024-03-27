"use server";

import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { deleteImage } from "./workers";

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

export async function deleteCategory(categoryId: string): Promise<number> {
  const db = await connectDB();

  // 해당 카테고리에 속한 모든 포스트 조회
  const posts = await db
    .collection("posts")
    .find({ category: new ObjectId(categoryId) })
    .toArray();

  // 각 포스트와 연관된 이미지 및 댓글 삭제
  for (const post of posts) {
    await deletePost(post._id.toString());
  }

  // 카테고리 삭제
  const categoryDeleteResult = await db
    .collection("categories")
    .deleteOne({ _id: new ObjectId(categoryId) });

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
  images: string[];
  image: string;
  like: string[];
  createdAt: Date; // ISO 문자열 형태로 변환
  updatedAt?: Date;
}

export async function addPost(
  categoryId: string,
  title_ko: string,
  title_ja: string,
  content_ko: string,
  content_ja: string,
  images: string[],
  image: string
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
    images,
    image,
    like: [],
    createdAt,
    updatedAt: null,
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
    images: doc.images,
    image: doc.image,
    like: doc.like,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.createdAt.toISOString(),
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
    images: doc.images,
    image: doc.image,
    like: doc.like,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.createdAt.toISOString(),
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
    images: post.images,
    image: post.image,
    like: post.like,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };

  return postFormatted;
}

export async function updatePost(
  postId: string,
  title_ko: string,
  title_ja: string,
  content_ko: string,
  content_ja: string,
  images: string[],
  image: string | null
) {
  const db = await connectDB();

  const result = await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        title_ko,
        title_ja,
        content_ko,
        content_ja,
        images,
        image,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount;
}

export async function deletePost(postId: string): Promise<number> {
  const db = await connectDB();
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }); // 먼저 포스트 정보를 조회

  if (post) {
    // 대표 이미지 삭제
    if (post.image) {
      await deleteImage(post.image);
    }

    // 나머지 이미지들 삭제
    if (post.images && post.images.length > 0) {
      await Promise.all(post.images.map((image: string) => deleteImage(image)));
    }
    // 포스트 삭제
    const deleteResult = await db
      .collection("posts")
      .deleteOne({ _id: new ObjectId(postId) });
    // 연관된 댓글들 삭제
    await db.collection("comments").deleteMany({ post: new ObjectId(postId) });

    return deleteResult.deletedCount; // 삭제된 포스트 수 반환
  }

  return 0; // 포스트가 없는 경우 0 반환
}

// 좋아요 추가
export async function likePost(
  postId: string,
  userId: string
): Promise<number> {
  const db = await connectDB();
  const result = await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    { $addToSet: { like: userId } } // 중복을 방지하면서 userId를 like 배열에 추가
  );
  return result.modifiedCount;
}

// 좋아요 취소
export async function unlikePost(
  postId: string,
  userId: string
): Promise<number> {
  const db = await connectDB();
  const result = await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    { $pull: { like: userId } } // userId를 like 배열에서 제거
  );
  return result.modifiedCount;
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
