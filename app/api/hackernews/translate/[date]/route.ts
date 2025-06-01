import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { logMessage } from "@/lib/logger";
import { translate } from "@/lib/openai/translate";
import { translateQueue } from "@/lib/queue";
import { getRedis } from "@/lib/redis";
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

  logMessage("▶️ All translation tasks enqueued. Waiting for completion...");
  await translateQueue.onIdle();
  logMessage("✅ All translation tasks completed. Flushing to R2...");

  let flushedKo = 0;
  let flushedJa = 0;
  let modifiedData = data.map((item: any) => ({ ...item }));

  // ko
  for (const item of toTranslateKo) {
    const translated = await redis.get(`ko:${item.id}`);
    if (translated) {
      const idx = modifiedData.findIndex((d: any) => d.id === item.id);
      if (idx !== -1) {
        if (!modifiedData[idx].summary) modifiedData[idx].summary = {};
        modifiedData[idx].summary.ko = translated;
        await redis.del(`ko:${item.id}`);
        flushedKo++;
      }
    }
  }

  // ja
  for (const item of toTranslateJa) {
    const translated = await redis.get(`ja:${item.id}`);
    if (translated) {
      const idx = modifiedData.findIndex((d: any) => d.id === item.id);
      if (idx !== -1) {
        if (!modifiedData[idx].summary) modifiedData[idx].summary = {};
        modifiedData[idx].summary.ja = translated;
        await redis.del(`ja:${item.id}`);
        flushedJa++;
      }
    }
  }

  await putToR2({ bucket: "hackernews", key }, modifiedData);

  const elapsed = Date.now() - start;
  logMessage(`Elapsed time: ${elapsed / 1000} seconds (${elapsed}ms)`);

  let message = "";
  if (isKo && !isJa) {
    message = `Flushed ${flushedKo} / ${toTranslateKo.length} ko translations to R2. (Elapsed: ${(elapsed / 1000).toFixed(2)} sec)`;
  } else if (!isKo && isJa) {
    message = `Flushed ${flushedJa} / ${toTranslateJa.length} ja translations to R2. (Elapsed: ${(elapsed / 1000).toFixed(2)} sec)`;
  } else {
    message = `Flushed ${flushedKo}/${toTranslateKo.length} ko, ${flushedJa}/${toTranslateJa.length} JA translations to R2. (Elapsed: ${(elapsed / 1000).toFixed(2)} sec)`;
  }

  return NextResponse.json({
    ok: true,
    ...(isKo && { totalKo: toTranslateKo.length, flushedKo }),
    ...(isJa && { totalJa: toTranslateJa.length, flushedJa }),
    message,
  });
}
