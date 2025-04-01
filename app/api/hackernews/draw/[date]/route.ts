import { checkBearerAuth } from "@/lib/auth";
import { getDailyFilePath, readJsonFile } from "@/lib/hackernews/fileUtils";
import { draw } from "@/lib/openai/draw";
import { drawQueue } from "@/lib/queue";
import axios from "axios";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

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
  today.setHours(today.getHours() + 9);
  const defaultDate = today.toISOString().slice(2, 10).replace(/-/g, "");
  const dateString = date ?? defaultDate;

  // Read data from the file based on the date
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

      // Set up file path and check for existing images
      const files = await fs.readdir(outputDir);
      const imageFiles = files.filter((file) => file.endsWith(".webp"));

      const baseFileName = `dall-${dateString}.webp`;
      let fileName = baseFileName;
      let filePath = path.join(outputDir, fileName);

      if (imageFiles.includes(baseFileName)) {
        let index = 1;

        while (true) {
          const paddedIndex = String(index).padStart(2, "0");
          fileName = `dall-${dateString}-${paddedIndex}.webp`;
          filePath = path.join(outputDir, fileName);

          try {
            await fs.access(filePath); 
            index++; 
          } catch {
            break; 
          }
        }
      }

      // Save the image as WebP
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      await sharp(response.data).webp().toFile(filePath);
      console.log(`✅ Saved image as WebP to ${filePath}`);

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
