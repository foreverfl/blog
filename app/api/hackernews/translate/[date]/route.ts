import { checkBearerAuth } from "@/lib/auth";
import {
  getDailyFilePath,
  readJsonFile,
  writeJsonFile,
} from "@/lib/hackernews/fileUtils";
import { translate } from "@/lib/openai/translate";
import { sendWebhookNotification } from "@/lib/webhook";
import { NextResponse } from "next/server";
import { translationQueue } from "@/lib/queue";

type TranslateRequestBody = {
  id: string;
  lan: "ko" | "ja";
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

  const body: TranslateRequestBody = await req.json();
  const { id, lan, webhookUrl } = body;

  if (!id || !lan) {
    return NextResponse.json({
      ok: false,
      error: "Missing id or lan parameter",
    });
  }

  const dailyFilePath = await getDailyFilePath("contents/trends/hackernews", date);
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

  const item = dailyData[existingIndex];
  const summaryEn = item?.summary?.en;
  const titleEn = item?.title?.en;

  if (!summaryEn) {
    return NextResponse.json({
      ok: false,
      error: "English summary not found for the item",
    });
  }

  const existingTranslation = item?.summary?.[lan];
  const existingTranslatedTitle = item?.title?.[lan];

  if (existingTranslation && existingTranslatedTitle) {
    console.log(
      `✅ Translation already exists for ID: ${id}, language: ${lan}. Skipping translation.`
    );
    return NextResponse.json({
      ok: true,
      message: `Translation for ${lan} already exists for ID: ${id}`,
    });
  }

  translationQueue.add(async () => {
    try {
      const [translatedSummary, translatedTitle] = await Promise.all([
        translate(summaryEn, lan, "content"),
        translate(titleEn, lan, "title"),
      ]);

      const dailyFilePath = await getDailyFilePath("contents/trends/hackernews", date);
      const dailyData = await readJsonFile(dailyFilePath);
      const existingIndex = dailyData.findIndex((item: { id: any }) => item.id === id);

      if (existingIndex !== -1) {
        dailyData[existingIndex].summary = {
          ...(dailyData[existingIndex].summary || {}),
          [lan]: translatedSummary,
        };
        dailyData[existingIndex].title = {
          ...(dailyData[existingIndex].title || {}),
          [lan]: translatedTitle,
        };

        await writeJsonFile(dailyFilePath, dailyData);
        console.log(`✅ Translations saved for ${lan}, id: ${id}`);
      }

      if (webhookUrl) {
        await sendWebhookNotification(webhookUrl, {
          id,
          language: lan,
          translatedTitle,
          translatedSummary,
        });
        console.log("📬 Sent translation to webhook");
      }
    } catch (error) {
      console.error("❌ Error translating:", error);
      if (webhookUrl) {
        await sendWebhookNotification(webhookUrl, {
          id,
          error: "Failed to translate the summary or title",
        });
      }
    }
  });

  return NextResponse.json({
    ok: true,
    message: `Translation for ${lan} queued for ${date ?? "today"}`,
  });
}
