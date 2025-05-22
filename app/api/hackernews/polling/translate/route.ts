import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { modifyQueue } from "@/lib/queue";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 10000;

export async function POST(req: Request) {
  const { id, language, date } = await req.json();

  if (!id || !language) {
    return NextResponse.json({ ok: false, error: "Missing id or language" });
  }

  const redisKey = `${language}:${id}:translation`;

  let redisData: string | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    redisData = await redis.get(redisKey);
    if (redisData) break;
    await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
  }

  if (!redisData) {
    return NextResponse.json({
      ok: false,
      error: `No Redis data for key ${redisKey}`,
    });
  }

  const { translatedSummary, translatedTitle } = JSON.parse(redisData);

  modifyQueue.add(async () => {
    const r2key = `${date ?? getTodayKST()}.json`;
    const data = await getFromR2({ bucket: "hackernews", key: r2key });
    const idx = data.findIndex((item: any) => item.id === id);

    if (idx !== -1) {
      data[idx].summary = {
        ...(data[idx].summary || {}),
        [language]: translatedSummary,
      };
      data[idx].title = {
        ...(data[idx].title || {}),
        [language]: translatedTitle,
      };

      await putToR2({ bucket: "hackernews", key: r2key }, data);
      await redis.del(redisKey);

      console.log(`✅ ${language} translation for ${id} flushed to R2 and Redis`);
    } else {
      console.warn(`⚠️ ID ${id} not found in R2 for translation`);
    }
  });

  return NextResponse.json({ ok: true, message: `Translation polling started for ${id}` });
}