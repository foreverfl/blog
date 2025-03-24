import { checkBearerAuth } from "@/lib/auth";
import { fetchContent } from "@/lib/hackernews/fetchContent";
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import { summarize } from "@/lib/openai/summarize";
import { sendWebhookNotification } from "@/lib/webhook";
import { NextResponse } from "next/server";
import {
  getDailyFilePath,
  readJsonFile,
  writeJsonFile,
} from "@/lib/hackernews/fileUtils";

type FetchContentRequestBody = {
  id: string;
  webhookUrl: string;
};

export async function POST(req: Request) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const body: FetchContentRequestBody = await req.json();
  const { id, webhookUrl } = body;

  if (!id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  const dailyFilePath = await getDailyFilePath("contents/hackernews");
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

  let content = dailyData[existingIndex].content;

  if (!content) {
    return NextResponse.json({
      ok: false,
      error: "Content not found for the item",
    });
  }

  summarize(content)
    .then(async (summary) => {
      const dailyFilePath = await getDailyFilePath("contents/hackernews");
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

      sendWebhookNotification(webhookUrl, { id, summary });
      console.log("📬 Sent summary to webhook");
    })
    .catch((error) => {
      console.error("❌ Error summarizing content:", error);
      sendWebhookNotification(webhookUrl, {
        id,
        error: "Failed to summarize the content",
      });
    });

  return NextResponse.json({
    ok: true,
    message: "Summary request received, processing in background",
  });
}
