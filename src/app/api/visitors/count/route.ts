import { connectDB } from "@/lib/mongodb";
import { Collection, Document } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface VisitDocument {
  date: Date;
  visitors: string[];
  count: number;
}

export async function GET(req: NextRequest) {
  const db = await connectDB();
  const visits = db.collection<VisitDocument>("visits");

  // 현재 날짜와 방문자 IP 주소를 구함
  const today = getToday();
  const yesterday = getYesterday();
  const visitorIP = getVisitorIP(req);

  // 방문자 카운트 업데이트
  await updateVisitorCount(today, visitorIP, visits);

  // 오늘 방문자 수
  const todayVisitorsCount = await visits.countDocuments({
    date: {
      $gte: today,
    },
  });

  // 어제 방문자 수
  const yesterdayVisitorsCount = await visits.countDocuments({
    date: {
      $gte: yesterday,
      $lt: today,
    },
  });

  // 총 방문자 수
  const totalVisitorsCount = await visits
    .aggregate([{ $group: { _id: null, total: { $sum: "$count" } } }])
    .toArray();

  const totalVisitors =
    totalVisitorsCount.length > 0 ? totalVisitorsCount[0].total : 0;

  // 총 방문자 수를 JSON으로 응답
  return new NextResponse(
    JSON.stringify({
      total: totalVisitors,
      today: todayVisitorsCount,
      prev: yesterdayVisitorsCount,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// 시간이 한국 날짜 생성
function getKSTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // UTC로 변환
  const kstOffset = 9 * 60 * 60000; // KST는 UTC+9
  return new Date(utc + kstOffset);
}

function getToday() {
  const today = getKSTDate();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
  return today;
}

function getYesterday() {
  const today = getToday();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // 어제 날짜 설정
  return yesterday;
}

// IP 주소를 추출하는 함수
const getVisitorIP = (req: NextRequest) => {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0] : req.ip;
  return ip || "";
};

async function updateVisitorCount(
  date: Date,
  visitorIP: string,
  visits: Collection<VisitDocument>
) {
  const filter = { date: date };
  const update = {
    $addToSet: { visitors: visitorIP },
  };
  const options = { upsert: true };
  const result = await visits.updateOne(filter, update, options);

  if (result.upsertedId || result.modifiedCount > 0) {
    // 문서가 삽입되었거나 변경된 경우, visitors 배열의 길이로 count 업데이트
    const updatedDoc = await visits.findOne(filter);
    if (updatedDoc) {
      const visitorCount = updatedDoc.visitors.length;
      await visits.updateOne(
        { _id: updatedDoc._id },
        { $set: { count: visitorCount } }
      );
    }
  }
}
