import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { getRedis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> },
) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const body = await req.json();
  const { type, lang, total } = body ?? {};

  const { date } = await params;
  const dateKey = date ?? getTodayKST();
  const keyName = `${dateKey}.json`;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { ok: false, error: "No Redis connection" },
      { status: 500 },
    );
  }

  const keys: string[] = await redis.keys("*");

  let en = 0,
    ja = 0,
    ko = 0,
    content = 0;
  for (const key of keys) {
    if (key.startsWith("en:")) en++;
    else if (key.startsWith("ja:")) ja++;
    else if (key.startsWith("ko:")) ko++;
    else if (key.startsWith("content:")) content++;
  }

  let canFlush = false;
  if (type === "summarize" && total === en) canFlush = true;
  if (type === "translate" && total === ko && lang === "ko") canFlush = true;
  if (type === "translate" && total === ja && lang === "ja") canFlush = true;
  if (type === "fetch" && total === content) canFlush = true;

  let attempted = false;
  let flushed = 0;
  let flushMessage = "";
  if (!canFlush) {
    flushMessage = "Flush condition not met. No items flushed.";
  } else {
    attempted = true;
    let data = await getFromR2({ bucket: "hackernews", key: keyName });
    if (data) {
      let modifiedData = data.map((item: any) => ({ ...item }));

      for (const item of data) {
        if (type === "summarize") {
          const summaryEn = await redis.get(`en:${item.id}`);
          if (summaryEn && (!item.summary || !item.summary.en)) {
            const idx = modifiedData.findIndex((d: any) => d.id === item.id);
            if (idx !== -1) {
              if (!modifiedData[idx].summary) modifiedData[idx].summary = {};
              modifiedData[idx].summary.en = summaryEn;
              await redis.del(`en:${item.id}`);
              flushed++;
            }
          }
        }
        if (type === "translate") {
          if (lang === "ko") {
            // summary.ko
            const summaryKo = await redis.get(`ko:summary:${item.id}`);
            if (summaryKo && (!item.summary || !item.summary.ko)) {
              const idx = modifiedData.findIndex((d: any) => d.id === item.id);
              if (idx !== -1) {
                if (!modifiedData[idx].summary) modifiedData[idx].summary = {};
                modifiedData[idx].summary.ko = summaryKo;
                await redis.del(`ko:summary:${item.id}`);
                flushed++;
              }
            }
            // title.ko
            const titleKo = await redis.get(`ko:title:${item.id}`);
            if (titleKo && (!item.title || !item.title.ko)) {
              const idx = modifiedData.findIndex((d: any) => d.id === item.id);
              if (idx !== -1) {
                if (!modifiedData[idx].title) modifiedData[idx].title = {};
                modifiedData[idx].title.ko = titleKo;
                await redis.del(`ko:title:${item.id}`);
                flushed++;
              }
            }
          } else if (lang === "ja") {
            // summary.ja
            const summaryJa = await redis.get(`ja:summary:${item.id}`);
            if (summaryJa && (!item.summary || !item.summary.ja)) {
              const idx = modifiedData.findIndex((d: any) => d.id === item.id);
              if (idx !== -1) {
                if (!modifiedData[idx].summary) modifiedData[idx].summary = {};
                modifiedData[idx].summary.ja = summaryJa;
                await redis.del(`ja:summary:${item.id}`);
                flushed++;
              }
            }
            // title.ja
            const titleJa = await redis.get(`ja:title:${item.id}`);
            if (titleJa && (!item.title || !item.title.ja)) {
              const idx = modifiedData.findIndex((d: any) => d.id === item.id);
              if (idx !== -1) {
                if (!modifiedData[idx].title) modifiedData[idx].title = {};
                modifiedData[idx].title.ja = titleJa;
                await redis.del(`ja:title:${item.id}`);
                flushed++;
              }
            }
          }
        }
        if (type === "fetch") {
          const contentVal = await redis.get(`content:${item.id}`);
          if (contentVal && !item.content) {
            const idx = modifiedData.findIndex((d: any) => d.id === item.id);
            if (idx !== -1) {
              modifiedData[idx].content = contentVal;
              await redis.del(`content:${item.id}`);
              flushed++;
            }
          }
        }
      }

      if (flushed > 0) {
        await putToR2({ bucket: "hackernews", key: keyName }, modifiedData);
        flushMessage = `Flushed ${flushed} items to R2.`;
      } else {
        flushMessage = `No eligible items found for flush.`;
      }
    } else {
      flushMessage = "File not found. Skipped flush.";
    }
  }

  return NextResponse.json({
    ok: true,
    type,
    lang,
    attempted,
    canFlush,
    flushed,
    counts: { en, ja, ko, content },
    totalKeys: keys.length,
    message: flushMessage,
  });
}
