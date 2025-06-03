import { checkBearerAuth } from "@/lib/auth";
import { getFromR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { logMessage } from "@/lib/logger";
import { translate } from "@/lib/openai/translate";
import { translateQueue } from "@/lib/queue";
import { clearRedis, getRedis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ date?: string }>; searchParams: URLSearchParams },
) {
  const start = Date.now();

  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const url = new URL(req.url);
  const lang = url.searchParams.get("lang");
  const isKo = lang === "ko";
  const isJa = lang === "ja";

  if (!isKo && !isJa) {
    return NextResponse.json({
      ok: false,
      error: "Invalid language",
    });
  }

  const { date } = await params;
  const targetDate = date ?? getTodayKST();
  const key = `${targetDate}.json`;

  let data = await getFromR2({ bucket: "hackernews", key });
  if (!data) return NextResponse.json({ ok: false, error: "File not found" });

  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: false, error: "No Redis" });

  try {
    await redis.ping();
  } catch (err) {
    clearRedis();
    logMessage("❌ Redis ping failed: " + err);
    return NextResponse.json({ ok: false, error: "Redis connection failed" });
  }

  let toTranslateKo: any[] = [];
  let toTranslateJa: any[] = [];

  if (isKo) {
    toTranslateKo = data.filter(
      (item: any) =>
        item.summary &&
        item.summary.en &&
        (!item.summary.ko || item.summary.ko === ""),
    );
  }

  if (isJa) {
    toTranslateJa = data.filter(
      (item: any) =>
        item.summary &&
        item.summary.en &&
        (!item.summary.ja || item.summary.ja === ""),
    );
  }

  if (isKo) logMessage("toTranslateKo.length: " + toTranslateKo.length);
  if (isJa) logMessage("toTranslateJa.length: " + toTranslateJa.length);

  // ko
  for (const [idx, item] of toTranslateKo.entries()) {
    translateQueue.add(async () => {
      try {
        logMessage(
          `[ko][${idx + 1}/${toTranslateKo.length}] Translating: ${item.id}...`,
        );
        const translated = await translate(item.summary.en, "ko", "content");
        await redis.set(`ko:${item.id}`, translated, "EX", 60 * 60 * 24);
        logMessage(
          `[ko][${idx + 1}/${toTranslateKo.length}] ✅ Done: ${item.id}`,
        );
      } catch (error) {
        console.error("❌ Error translating (ko):", error);
        logMessage(
          `[ko][${idx + 1}/${toTranslateKo.length}] ❌ Error: ${item.id} (${error})`,
        );
      }
    });
  }

  // ja
  for (const [idx, item] of toTranslateJa.entries()) {
    translateQueue.add(async () => {
      try {
        logMessage(
          `[ja][${idx + 1}/${toTranslateJa.length}] Translating: ${item.id}...`,
        );
        const translated = await translate(item.summary.en, "ja", "content");
        await redis.set(`ja:${item.id}`, translated, "EX", 60 * 60 * 24);
        logMessage(
          `[ja][${idx + 1}/${toTranslateJa.length}] ✅ Done: ${item.id}`,
        );
      } catch (error) {
        console.error("❌ Error translating (ja):", error);
        logMessage(
          `[ja][${idx + 1}/${toTranslateJa.length}] ❌ Error: ${item.id} (${error})`,
        );
      }
    });
  }

  return NextResponse.json({
    ok: true,
    type: "translate",
    lang: lang, // "ko" or "ja"
    ...(isKo && { total: toTranslateKo.length }),
    ...(isJa && { total: toTranslateJa.length }),
    message: `Enqueued ${isKo ? toTranslateKo.length : 0} ko, ${isJa ? toTranslateJa.length : 0} ja translation tasks.`,
  });
}
