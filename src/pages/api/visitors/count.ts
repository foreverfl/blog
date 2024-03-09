import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import { Collection, Document } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Only GET requests are allowed" });
    return;
  }

  const db = await connectDB();
  const visits = db.collection("visits");

  // 현재 날짜와 방문자 IP 주소를 구함
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
  const visitorIP = getVisitorIP(req);

  // 방문자 카운트 업데이트
  await updateVisitorCount(date, visitorIP, visits);

  // 총 방문자 수 조회
  const totalVisitors = await getTotalVisitors(visits);

  res.status(200).json({ date, visitorIP });
}

// IP 주소를 추출하는 함수
const getVisitorIP = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]
      : req.socket.remoteAddress;
  return ip || "";
};

async function updateVisitorCount(
  date: string,
  visitorIP: string,
  visits: Collection<Document>
) {
  const filter = { date: date, visitors: { $ne: visitorIP } };
  const update = {
    $inc: { count: 1 },
    $addToSet: { visitors: visitorIP },
  };
  const options = { upsert: true };
  await visits.updateOne(filter, update, options);
}

async function getTotalVisitors(visits: Collection<Document>) {
  const result = await visits
    .aggregate([{ $group: { _id: null, total: { $sum: "$count" } } }])
    .toArray();

  return result[0]?.total || 0;
}
