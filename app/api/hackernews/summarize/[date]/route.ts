import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { summarize } from "@/lib/openai/summarize";
import { summaryQueue } from "@/lib/queue";
import { sendWebhookNotification } from "@/lib/webhook";
import { NextResponse } from "next/server";

export async function POST(
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

  const body = await req.json();
  const { id, webhookUrl } = body;

  if (!id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  let dailyData = await getFromR2({ bucket: "hackernews", key });

  if (!dailyData) {
    return NextResponse.json({
      ok: false,
      error: "Daily file not found in R2",
    });
  }

  const existingIndex = dailyData.findIndex(
    (item: { id: any }) => item.id === id
  );

  if (existingIndex === -1) {
    return NextResponse.json({
      ok: false,
      error: "Item not found in daily data",
    });
  }

  const existingItem = dailyData[existingIndex];

  if (existingItem.summary && existingItem.summary.en) {
    console.log(`✅ Summary already exists for ID: ${id}, skipping summarize.`);
    return NextResponse.json(existingItem);
  }

  let content = existingItem.content;

  if (!content) {
    return NextResponse.json({
      ok: false,
      error: "Content not found for the item",
    });
  }

  summaryQueue.add(async () => {
    try {
      const summary = await summarize(content);

      const latestData = await getFromR2({ bucket: "hackernews", key });
      const idx = latestData.findIndex((item: { id: string }) => item.id === id);

      if (idx !== -1) {
        latestData[idx].summary = {
          ...(latestData[idx].summary || {}),
          en: summary,
        };
        await putToR2({ bucket: "hackernews", key }, latestData);
        console.log(`✅ summary.en saved for id ${id}`);
      } else {
        console.warn(`⚠️ No entry found for id ${id} when saving summary`);
      }

      await sendWebhookNotification(webhookUrl, { id, summary });
      console.log("📬 Sent summary to webhook");
    } catch (error) {
      console.error("❌ Error summarizing content:", error);
      await sendWebhookNotification(webhookUrl, {
        id,
        error: "Failed to summarize the content",
      });
    }
  });

  return NextResponse.json({
    ok: true,
    message: `Summary request for ${date ?? "today"} queued.`,
  });
}
