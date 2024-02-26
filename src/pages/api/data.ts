import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";

type ResponseData = {
  data: any[]; // MongoDB에서 조회한 데이터를 담을 배열
  error?: string; // 에러 메시지를 담을 필드 (옵셔널)
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const db = await connectDB();
    const data = await db.collection("users").find({}).limit(10).toArray(); // 예시로 3개의 문서만 조회
    res.status(200).json({ data });
  } catch (error) {
    console.error("Database connection failed", error);
    res.status(500).json({
      error: "Failed to connect to database",
      data: [],
    });
  }
}
