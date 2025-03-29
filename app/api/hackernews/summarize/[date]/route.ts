import { checkBearerAuth } from "@/lib/auth";
import {
  getDailyFilePath,
  readJsonFile,
  writeJsonFile,
} from "@/lib/hackernews/fileUtils";
import { summarize } from "@/lib/openai/summarize";
import { summaryQueue } from "@/lib/queue";
import { sendWebhookNotification } from "@/lib/webhook";
import { NextResponse } from "next/server";

type FetchContentRequestBody = {
  id: string;
  webhookUrl: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> }
) {
  const { date } = await params; 

  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const body: FetchContentRequestBody = await req.json();
  const { id, webhookUrl } = body;

  if (!id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  // Fetch from file
  const dailyFilePath = await getDailyFilePath(
    "contents/trends/hackernews",
    date
  );
  let dailyData = await readJsonFile(dailyFilePath);

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

  let content = dailyData[existingIndex].content;

  if (!content) {
    return NextResponse.json({
      ok: false,
      error: "Content not found for the item",
    });
  }

  summaryQueue.add(async () => {
    try {
      const summary = await summarize(content);

      const dailyFilePath = await getDailyFilePath(
        "contents/trends/hackernews",
        date
      );
      let dailyData = await readJsonFile(dailyFilePath);

      const existingIndex = dailyData.findIndex(
        (item: { id: any }) => item.id === id
      );

      if (existingIndex !== -1) {
        dailyData[existingIndex].summary = {
          ...(dailyData[existingIndex].summary || {}),
          en: summary,
        };
        await writeJsonFile(dailyFilePath, dailyData);
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
