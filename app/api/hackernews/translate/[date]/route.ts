import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { translate } from "@/lib/openai/translate";
import { translateQueue } from "@/lib/queue";
import { getRedis } from "@/lib/redis";
import { sendWebhookNotification } from "@/lib/webhook";
import { NextResponse } from "next/server";

type TranslateRequestBody = {
  id: string;
  lan: "ko" | "ja";
  webhookUrl: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> }
) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const { date } = await params;
  const targetDate = date ?? getTodayKST();
  const key = `${targetDate}.json`;
  const body: TranslateRequestBody = await req.json();
  const { id, lan, webhookUrl } = body;

  if (!id || !lan) {
    return NextResponse.json({
      ok: false,
      error: "Missing id or lan parameter",
    });
  }

  let dailyData = await getFromR2({ bucket: "hackernews", key });

  const existingIndex = dailyData.findIndex(
    (item: { id: any }) => item.id === id
  );

  if (existingIndex === -1) {
    return NextResponse.json({
      ok: false,
      error: "Item not found in daily data",
    });
  }

  const item = dailyData[existingIndex];
  const summaryEn = item?.summary?.en;
  const titleEn = item?.title?.en;

  if (!summaryEn) {
    return NextResponse.json({
      ok: false,
      error: "English summary not found for the item",
    });
  }

  const redisKey = `${lan}:${id}:translation`;

  translateQueue.add(async () => {
    try {
      const [translatedSummary, translatedTitle] = await Promise.all([
        translate(summaryEn, lan, "content"),
        translate(titleEn, lan, "title"),
      ]);
      
      const redis = getRedis();
      if (redis)
        redis.set(
          redisKey,
          JSON.stringify({
            translatedSummary,
            translatedTitle,
          }),
          "EX",
          60 * 60 * 24
        );

      if (webhookUrl) {
        await sendWebhookNotification(webhookUrl, {
          id,
          language: lan,
          date: targetDate,
        });
        console.log(`✅ Translation for ID: ${id} saved successfully.`);
      }
    } catch (error) {
      console.error("❌ Error translating:", error);
      if (webhookUrl) {
        await sendWebhookNotification(webhookUrl, {
          id,
          language: lan,
          date: targetDate,
          error: "Translation failed",
        });
      }
    }
  });

  return NextResponse.json({
    ok: true,
    message: `Translation for ${lan} queued for ${date ?? "today"}`,
  });
}
