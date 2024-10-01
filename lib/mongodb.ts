"use server";

import { Db, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { filePaths } from "@/contents/mdxFiles";

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
    console.log("Reusing existing database connection.");
    return db;
  }

  // 클라이언트 연결
  console.log("Establishing new database connection.");
  await client.connect();
  db = client.db("blog");

  // 연결 상태 확인
  await db.command({ ping: 1 });
  return db;
}

// User CRUD
export async function getUsersInfoByIds(userIds: string[]) {
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

// Post CRUD

// 포스트 업서트
export async function upsertFilePathsToMongoDB() {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  // 파일 경로들을 MongoDB에 업서트
  const bulkOperations = filePaths.map((filePath) => {
    return {
      updateOne: {
        filter: { path: filePath }, // 파일 경로로 중복 여부 확인
        update: {
          $set: {
            path: filePath,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await postsCollection.bulkWrite(bulkOperations);
  return result;
}

// 포스트 삭제
export async function deleteAllPostsFromMongoDB() {
  const db = await connectDB();
  const postsCollection = db.collection("posts");

  // MongoDB 컬렉션에서 모든 문서 삭제
  const result = await postsCollection.deleteMany({});
  return result;
}

// 좋아요

// 좋아요 취소

// 댓글 추가

// 댓글 수정

// 댓글 삭제
