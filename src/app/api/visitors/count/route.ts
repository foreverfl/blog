import { connectDB } from "@/lib/mongodb";
import { Collection, Document } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface VisitDocument {
  date: string;
  visitors: string[];
  count: number;
}

export async function GET(req: NextRequest) {
  const db = await connectDB();
  const visits = db.collection<VisitDocument>("visits");

  // 현재 날짜와 방문자 IP 주소를 구함
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
  const visitorIP = getVisitorIP(req);

  // 방문자 카운트 업데이트
  await updateVisitorCount(date, visitorIP, visits);

  // 총 방문자 수 조회
  const totalVisitors = await getTotalVisitors(visits);

  // 총 방문자 수를 JSON으로 응답
  return new NextResponse(JSON.stringify({ date, visitorIP, totalVisitors }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// IP 주소를 추출하는 함수
const getVisitorIP = (req: NextRequest) => {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0] : req.ip;
  return ip || "";
};

async function updateVisitorCount(
  date: string,
  visitorIP: string,
  visits: Collection<VisitDocument>
) {
  const filter = { date: date, visitors: { $ne: visitorIP } };
  const update = {
    $inc: { count: 1 },
    $addToSet: { visitors: visitorIP },
  };
  const options = { upsert: true };
  await visits.updateOne(filter, update, options);
}

async function getTotalVisitors(visits: Collection<VisitDocument>) {
  const result = await visits
    .aggregate([{ $group: { _id: null, total: { $sum: "$count" } } }])
    .toArray();

  return result[0]?.total || 0;
}
