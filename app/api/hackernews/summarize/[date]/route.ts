import { checkBearerAuth } from "@/lib/auth";
import { getFromR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { logMessage } from "@/lib/logger";
import { summarize } from "@/lib/openai/summarize";
import { summarizeQueue } from "@/lib/queue";
import { clearRedis, getRedis } from "@/lib/redis";
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

  const toSummarize = data.filter(
    (item: any) => item.content && (!item.summary || !item.summary.en),
  );

  logMessage("toSummerize.length: " + toSummarize.length);

  for (const [idx, item] of toSummarize.entries()) {
    summarizeQueue.add(async () => {
      try {
        logMessage(
          `[${idx + 1}/${toSummarize.length}] Summerizing: ${item.id}...`,
        );
        const summary = await summarize(item.content);
        await redis.set(`en:${item.id}`, summary, "EX", 60 * 60 * 24);
        logMessage(`[${idx + 1}/${toSummarize.length}] ✅ Done: ${item.id}`);
      } catch (error) {
        logMessage(
          `[${idx + 1}/${toSummarize.length}] ❌ Error: ${item.id} (${error})`,
        );
      }
    });
  }

  return NextResponse.json({
    ok: true,
    type: "summarize",
    total: toSummarize.length,
    message: `Enqueued ${toSummarize.length} summerize tasks.`,
  });
}
