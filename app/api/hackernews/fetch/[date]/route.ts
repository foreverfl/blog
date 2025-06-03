import { checkBearerAuth } from "@/lib/auth";
import { getFromR2 } from "@/lib/cloudflare/r2";
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

  const keys = await redis.keys("content:*");
  const successCount = keys.length;
  console.log("total: ", successCount);

  return NextResponse.json({
    ok: true,
    type: "fetch",
    total: successCount,
    message: `Enqueued ${toFetch.length} fetch tasks.`,
  });
}
