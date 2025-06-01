"use server";

import { Db, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { logMessage } from "@/lib/logger";

interface Comment {
  _id: ObjectId; // 댓글 ID
  userEmail: string; // 작성자 이메일
  username: string; // 작성자 이름
  photo: string; // 프로필 사진 URL
  comment: string; // 댓글 내용
  userCreatedAt: Date; // 댓글 생성 시간
  adminComment: string; // 관리자 댓글
  adminCreatedAt: Date | null; // 관리자 댓글 생성 시간
}

interface Post {
  _id: ObjectId; // 게시물 ID
  pathHash: string; // 게시물 경로 해시
  comments: Comment[]; // 댓글 배열
  likes: string[]; // 좋아요 사용자 목록
  path: string; // 게시물 경로
}

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
    logMessage("Reusing existing database connection.");
    return db;
  }

  // 클라이언트 연결
  logMessage("Establishing new database connection.");
  await client.connect();
  db = client.db("blog");

  // 연결 상태 확인
  await db.command({ ping: 1 });
  return db;
}

// User CRUD

export async function upsertUser(userData: any) {
  const db = await connectDB();
  const usersCollection = db.collection("users");

  const result = await usersCollection.updateOne(
    { email: userData.email },
    { $set: userData },
    { upsert: true }
  );

  return result;
}

export async function getUsersInfoByIds(userIds: string[]) {
  const objectIds = userIds.map((id) => new ObjectId(id));
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

export async function findUserByEmail(email: string) {
  const db = await connectDB();
  const usersCollection = db.collection("users");
  const user = await usersCollection.findOne({ email });
  return user;
}

// Post CRUD
export async function deleteAllPostsFromMongoDB() {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  const result = await postsCollection.deleteMany({});
  return result;
}

// Like CRUD
export async function addLikeToPost(pathHash: string, userEmail: string) {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  const result = await postsCollection.updateOne(
    { pathHash },
    {
      $addToSet: { likes: userEmail }, // likes 배열에 사용자 이메일 추가, 중복 방지
    }
  );
  return result;
}

export async function removeLikeFromPost(pathHash: string, userEmail: string) {
  const db = await connectDB();
  const postsCollection = db.collection<Post>("posts");

  const result = await postsCollection.updateOne(
    { pathHash },
    {
      $pull: { likes: { $eq: userEmail } }, // $eq 사용하여 조건 지정
    }
  );
  return result;
}

export async function getLikeCountForPost(pathHash: string) {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  const post = await postsCollection.findOne(
    { pathHash },
    { projection: { likes: 1 } } // likes 필드만 가져오기
  );

  return post?.likes.length || 0; // likes 배열의 길이를 반환
}

export async function checkLikeStatus(pathHash: string, userEmail: string) {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  const post = await postsCollection.findOne(
    { pathHash, likes: userEmail }, // 해당 게시글의 likes 배열에 사용자가 있는지 확인
    { projection: { likes: 1 } }
  );

  return post ? true : false; // 사용자가 이미 좋아요를 눌렀으면 true, 아니면 false 반환
}

// Comment CRUD - User
export async function addUserCommentToPost(pathHash: string, commentData: any) {
  const db = await connectDB();
  const postsCollection = db.collection<Post>("posts");

  const comment = {
    _id: new ObjectId(),
    userEmail: commentData.userEmail,
    username: commentData.username,
    photo: commentData.photo,
    comment: commentData.comment,
    userCreatedAt: new Date(),
    adminComment: "",
    adminCreatedAt: null,
  };

  const result = await postsCollection.updateOne(
    { pathHash },
    {
      $push: { comments: comment },
    }
  );
  return result;
}

export async function updateUserComment(
  pathHash: string,
  commentId: string,
  newComment: string
) {
  const db = await connectDB();
  const postsCollection = db.collection<Post>("posts");

  const result = await postsCollection.updateOne(
    { pathHash, "comments._id": new ObjectId(commentId) },
    {
      $set: { "comments.$.comment": newComment },
    }
  );
  return result;
}

export async function deleteComment(
  pathHash: string,
  commentId: string,
  userEmail: string
) {
  const db = await connectDB();
  const postsCollection = db.collection<Post>("posts");

  const result = await postsCollection.updateOne(
    { pathHash },
    {
      $pull: { comments: { _id: new ObjectId(commentId), userEmail } },
    }
  );
  return result;
}

export async function getCommentsForPost(pathHash: string) {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  const post = await postsCollection.findOne(
    { pathHash },
    { projection: { comments: 1 } }
  );

  return post?.comments || [];
}

// Comment CRUD - Admin
export async function upsertAdminComment(
  pathHash: string,
  commentId: string,
  adminComment: string
) {
  const db = await connectDB();
  const postsCollection = db.collection<Post>("posts");

  const result = await postsCollection.updateOne(
    { pathHash, "comments._id": new ObjectId(commentId) },
    {
      $set: {
        "comments.$.adminComment": adminComment,
        "comments.$.adminCreatedAt": new Date(),
      },
    },
    {
      upsert: false,
    }
  );

  return result;
}

export async function deleteAdminComment(pathHash: string, commentId: string) {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  const result = await postsCollection.updateOne(
    { pathHash, "comments._id": new ObjectId(commentId) },
    {
      $set: {
        "comments.$.adminComment": "",
        "comments.$.adminCreatedAt": null,
      },
    }
  );
  return result;
}
