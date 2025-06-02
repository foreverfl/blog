import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { fetchContent } from "@/lib/hackernews/fetchContent";
import { fetchPdfContent } from "@/lib/hackernews/fetchPdfContent";
import { logMessage } from "@/lib/logger";
import { fetchQueue } from "@/lib/queue";
import { clearRedis, getRedis } from "@/lib/redis";
import { sliceTextByTokens } from "@/lib/text";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> },
) {
  const start = Date.now();
  
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const { date } = await params;
  const dateKey = date ?? getTodayKST();
  const key = `${dateKey}.json`;

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

  const toFetch = data.filter((item: any) => !item.content && item.url);

  logMessage(`toFetch.length: ${toFetch.length}`);

  for (const [idx, item] of toFetch.entries()) {
    fetchQueue.add(async () => {
      try {
        logMessage(`[${idx + 1}/${toFetch.length}] Fetching: ${item.id}...`);
        let content = null;

        if (item.url.includes(".pdf")) {
          content = await fetchPdfContent(item.url);
          logMessage(`📄 PDF content extracted for ${item.url}`);
        } else {
          content = await fetchContent(item.url);
          logMessage(`🌐 Smart content fetched for ${item.url}`);
        }

        if (content) {
          content = await sliceTextByTokens(content, 15000);
          logMessage(`📄 Sliced content (up to 15000 tokens)`);
        }

        // 임시로 redis에 저장
        if (content) {
          await redis.set(`content:${item.id}`, content, "EX", 60 * 60 * 24);
        }
        logMessage(`[${idx + 1}/${toFetch.length}] ✅ Done: ${item.id}`);
      } catch (error) {
        logMessage(
          `[${idx + 1}/${toFetch.length}] ❌ Error: ${item.id} (${error})`,
        );
      }
    });
  }

  logMessage("▶️ All fetch tasks enqueued. Waiting for completion...");
  await fetchQueue.onIdle();
  logMessage("✅ All fetch tasks completed. Flushing to R2...");

  let flushed = 0;
  let modifiedData = data.map((item: any) => ({ ...item }));

  for (const item of toFetch) {
    const content = await redis.get(`content:${item.id}`);
    if (content) {
      const idx = modifiedData.findIndex((d: any) => d.id === item.id);
      if (idx !== -1) {
        modifiedData[idx].content = content;
        await redis.del(`content:${item.id}`);
        flushed++;
      }
    }
  }

  await putToR2({ bucket: "hackernews", key }, modifiedData);

  const elapsed = Date.now() - start;
  logMessage(`Elapsed time: ${elapsed / 1000} seconds (${elapsed}ms)`);

  return NextResponse.json({
    ok: true,
    total: toFetch.length,
    flushed,
    message: `Flushed ${flushed} out of ${toFetch.length} contents to R2. (Elapsed: ${(elapsed / 1000).toFixed(2)} sec)`,
  });
}
