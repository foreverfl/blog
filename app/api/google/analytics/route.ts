import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Google Analytics 4 Property ID를 환경 변수로 가져옵니다.
const propertyId = process.env.GA4_PROPERTY_ID;

// Google Analytics Data API 클라이언트 초기화
const analyticsDataClient = new BetaAnalyticsDataClient();

export async function GET() {
  try {
    // Google Analytics Data API 호출
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "7daysAgo", // 지난 7일간 데이터
          endDate: "today",
        },
      ],
      dimensions: [
        {
          name: "date", // 날짜별 데이터
        },
      ],
      metrics: [
        {
          name: "activeUsers", // 활성 사용자 수
        },
      ],
    });

    // API 응답을 JSON으로 반환
    const result =
      response.rows?.map((row) => ({
        date: row.dimensionValues?.[0]?.value ?? "Unknown date",
        activeUsers: row.metricValues?.[0]?.value ?? "0",
      })) ?? [];

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Failed to fetch Google Analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
