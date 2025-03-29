import { checkBearerAuth } from "@/lib/auth";
import { getDailyFilePath, readJsonFile } from "@/lib/hackernews/fileUtils";
import { draw } from "@/lib/openai/draw";
import { drawQueue } from "@/lib/queue";
import axios from "axios";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> }
) {
  const { date } = await params;

  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  const { webhookUrl } = await req.json();

  // Date formatting
  const today = new Date();
  const defaultDate = today.toISOString().slice(2, 10).replace(/-/g, "");
  const dateString = date ?? defaultDate;

  // 날짜 파일에서 데이터 읽기
  const filePath = await getDailyFilePath(
    "contents/trends/hackernews",
    dateString
  );
  const items = await readJsonFile(filePath);

  const topItem = items
    .filter((item: any) => {
      const en = item.summary?.en;
      return typeof en === "string" && en.trim().length > 0;
    })
    .sort((a: any, b: any) => b.score - a.score)[0];

  console.log("score: ", topItem?.score);

  if (!topItem) {
    return NextResponse.json({
      ok: false,
      error: "No valid item with non-empty summary.en found",
    });
  }

  if (!topItem || !topItem.summary?.en) {
    return NextResponse.json({
      ok: false,
      error: "No valid item with summary.en found",
    });
  }

  drawQueue.add(async () => {
    try {
      const imageUrl = await draw(dateString);
      const outputDir = path.join(
        process.cwd(),
        "public",
        "images",
        "hackernews"
      );
      await fs.mkdir(outputDir, { recursive: true });

      // 파일 경로 설정
      const files = await fs.readdir(outputDir);
      const imageFiles = files.filter((file) => file.endsWith(".png"));

      // 파일 인덱스 설정
      const existingIndexes = imageFiles
        .filter((file) => file.startsWith(`dall-${dateString}`))
        .map((file) => parseInt(file.match(/-(\d{2})\.png/)?.[1] ?? "0"));
      const nextIndex = Math.max(...existingIndexes) + 1;
      const paddedIndex = String(nextIndex).padStart(2, "0");

      // 파일 이름 설정
      const fileName = `dall-${dateString}-${paddedIndex}.png`;
      const filePath = path.join(outputDir, fileName);
      console.log(`fileName: ${fileName}`);

      // 이미지 저장
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      await fs.writeFile(filePath, response.data);
      console.log(`✅ Saved image to ${filePath}`);

      if (webhookUrl) {
        await axios.post(webhookUrl, {
          ok: true,
          fileName,
          filePath: `public/images/hackernews/${dateString}`,
        });
        console.log(`📬 Sent webhook to ${webhookUrl}`);
      }
    } catch (err) {
      console.error("❌ Failed to generate or save image in queue:", err);
      if (webhookUrl) {
        await axios.post(webhookUrl, {
          ok: false,
          error: "Failed to generate or save image",
        });
      }
    }
  });

  return NextResponse.json({
    ok: true,
    message: "Image generation request queued.",
  });
}
