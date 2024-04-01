"use server";

import { Db, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
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

let db: Db | null = null; // 전역 변수로 데이터베이스 인스턴스를 유지

// DB 연결하기
export async function connectDB() {
  // 이미 데이터베이스 인스턴스가 있는 경우, 재사용
  if (db) {
    // console.log("Reusing existing database connection.");
    return db;
  }

  // 클라이언트 연결
  // console.log("Establishing new database connection.");
  await client.connect();
  db = client.db("blog");

  // 연결 상태 확인
  await db.command({ ping: 1 });
  return db;
}

// 프로세스 종료 시에 데이터베이스 연결 닫기
process.on("exit", async () => {
  await client.close();
});

// User CRUD
export async function getUsersInfoByIds(userIds: string[]) {
  await client.connect();

  const objectIds = userIds.map((id) => new ObjectId(id)); // ObjectId 배열 생성

  const db = await connectDB();

  // 사용자 정보 조회
  const users = await db
    .collection("users")
    .find({
      _id: { $in: objectIds },
    })
    .toArray();

  const usersInfo = users.map((user) => ({
    _id: user._id.toString(),
    username: user.username,
    photo: user.photo,
  }));

  return usersInfo;
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
    .sort({ index: 1 })
    .toArray();
  const categories = await db
    .collection("categories")
    .find({})
    .sort({ index: 1 })
    .toArray();

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
  likeCount?: number;
  createdAt: Date;
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
    updatedAt: createdAt,
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

export async function getPostsForMain(): Promise<{
  popularPosts: Post[];
  recentPosts: Post[];
}> {
  const db = await connectDB();

  // 인기 포스트 가져오기: like가 많은 순으로 상위 8개
  const popularPosts = await db
    .collection("posts")
    .aggregate([
      {
        $addFields: {
          likeCount: { $size: "$like" }, // like 배열의 길이를 계산하여 likeCount 필드를 추가
        },
      },
      { $sort: { likeCount: -1, updatedAt: -1 } }, // 내림차순 정렬
      { $limit: 8 }, // 상위 8개 문서만 선택
      {
        $project: {
          _id: 1,
          index: 1,
          category: 1,
          title_ko: 1,
          title_ja: 1,
          content_ko: 1,
          content_ja: 1,
          images: 1,
          image: 1,
          like: 1,
          likeCount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ])
    .toArray()
    .then((posts) =>
      posts.map((doc) => ({
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
        likeCount: doc.likeCount, // likeCount 필드 추가
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }))
    );

  // 최근 포스트 가져오기: 날짜가 최신인 순으로 상위 8개
  const recentPosts = await db
    .collection("posts")
    .find({})
    .sort({ updatedAt: -1 })
    .limit(8)
    .toArray()
    .then((posts) =>
      posts.map((doc) => ({
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
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }))
    );

  return { popularPosts, recentPosts };
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
    updatedAt: post.updatedAt?.toISOString(),
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
interface Comment {
  _id: string;
  index: number;
  user: string;
  post: string;
  lan: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotified: boolean;
  answer?: string;
  answeredAt?: Date;
  userNotified?: boolean;
}

export async function addComment(
  post: string,
  user: string,
  content: string,
  lan: string
): Promise<Comment> {
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
    index: currentIndex,
    user: new ObjectId(user),
    post: new ObjectId(post),
    lan,
    content,
    createdAt,
    updatedAt: createdAt, // 처음 생성 시점에서 updatedAt도 동일하게 설정
    adminNotified: false,
  };
  const result = await db.collection("comments").insertOne(comment);
  return {
    _id: result.insertedId.toString(),
    index: currentIndex,
    user: new ObjectId(user).toString(),
    post: new ObjectId(post).toString(),
    lan,
    content,
    createdAt,
    updatedAt: createdAt,
    adminNotified: false,
  };
}

export async function getCommentsByPost(postId: string) {
  const db = await connectDB();
  const comments = await db
    .collection("comments")
    .find({ post: new ObjectId(postId) })
    .toArray();
  const commentsFormatted: Comment[] = comments.map((doc) => ({
    _id: doc._id.toString(),
    index: doc.index,
    user: doc.user.toString(),
    post: doc.post.toString(),
    lan: doc.lan,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    adminNotified: doc.adminNotified,
    answer: doc.answer,
    answeredAt: doc.answeredAt,
    userNotified: doc.userNotified,
  }));
  return commentsFormatted;
}

export async function updateCommentContent(commentId: string, content: string) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { content: content, updatedAt: new Date() } }
    );
  return result.upsertedId;
}

export async function updateCommentWithAnswer(
  commentId: string,
  answer: string
) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { answer: answer, answeredAt: new Date(), adminNotified: true } }
    );
  return result.upsertedId;
}

export async function updateCommentAdminNotified(
  commentId: string,
  adminNotified: boolean
) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { adminNotified: adminNotified } }
    );
  return result.upsertedId;
}

export async function updateCommentUserNotified(
  commentId: string,
  userNotified: boolean
) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { userNotified: userNotified } }
    );
  return result.upsertedId;
}

export async function deleteComment(commentId: string) {
  const db = await connectDB();
  const result = await db
    .collection("comments")
    .deleteOne({ _id: new ObjectId(commentId) });
  return result.deletedCount;
}
