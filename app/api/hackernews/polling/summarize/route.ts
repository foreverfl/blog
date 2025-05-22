import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { modifyQueue } from "@/lib/queue";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const validLangKeys = ["en", "ko", "ja"] as const;
type LangKey = (typeof validLangKeys)[number];

const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 10000;

export async function POST(req: Request) {
  const { classification, id, date } = (await req.json().catch(() => ({}))) as {
    classification?: LangKey;
    id?: string;
    date?: string;
  };

  if (!id || !classification) {
    return NextResponse.json({
      ok: false,
      error: "Missing id or classification",
    });
  }

  const redisKey = `${classification}:${id}`;

  let summary: string | null = null;

  for (let i = 0; i < MAX_RETRIES; i++) {
    summary = await redis.get(redisKey);
    if (summary) break;
    await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
  }

  if (!summary) {
    console.warn(`❌ No Redis data found for key ${redisKey}`);
    return NextResponse.json({ ok: false, error: "No data found in Redis" });
  }

  modifyQueue.add(async () => {
    const targetDate = date ?? getTodayKST();
    const r2key = `${targetDate}.json`;

    const data = await getFromR2({ bucket: "hackernews", key: r2key });
    const idx = data.findIndex((item: any) => item.id === id);

    if (idx !== -1) {
      if (!data[idx].summary) data[idx].summary = {};

      data[idx].summary[classification] = summary;

      await putToR2({ bucket: "hackernews", key: r2key }, data);
      await redis.del(redisKey);

      console.log(
        `✅ ${classification} summary for ${id} flushed to R2 and Redis entry deleted`
      );
    } else {
      console.warn(`⚠️ ID ${id} not found in R2`);
    }
  });

  return NextResponse.json({
    ok: true,
    message: `Polling triggered for ${classification}:${id}`,
  });
}
