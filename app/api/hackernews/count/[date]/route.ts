import { checkBearerAuth } from "@/lib/auth";
import { getFromR2 } from "@/lib/cloudflare/r2";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ date?: string }> }
) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const { date } = await params;
  const targetDate =
    date ?? new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const key = `${targetDate}.json`;

  try {
    const dailyData = await getFromR2({ bucket: "hackernews", key });

    if (!Array.isArray(dailyData)) {
      return NextResponse.json({
        ok: false,
        error: "Daily data is not an array",
      });
    }

    const result = {
      nullContentCount: 0,
      nullSummaryEnCount: 0,
      nullSummaryJaCount: 0,
      nullSummaryKoCount: 0,
    };

    dailyData.forEach((item: any) => {
      if (!item.content || item.content.trim() === "")
        result.nullContentCount++;
      if (!item.summary?.en || item.summary.en.trim() === "")
        result.nullSummaryEnCount++;
      if (!item.summary?.ja || item.summary.ja.trim() === "")
        result.nullSummaryJaCount++;
      if (!item.summary?.ko || item.summary.ko.trim() === "")
        result.nullSummaryKoCount++;
    });

    return NextResponse.json({
      ok: true,
      date,
      counts: result,
      message: `Null fields count: content=${result.nullContentCount}, summary.en=${result.nullSummaryEnCount}, summary.ja=${result.nullSummaryJaCount}, summary.ko=${result.nullSummaryKoCount}`,
    });
  } catch (error) {
    console.error("❌ Error while reading daily data:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to process daily data",
    });
  }
}
