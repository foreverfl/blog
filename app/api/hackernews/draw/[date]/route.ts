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

      // Set up file path and check for existing images
      const files = await fs.readdir(outputDir);
      const imageFiles = files.filter((file) => file.endsWith(".webp"));

      // Check if files - dall-<date>.webp - with the specific date already exist
      const matchingFiles = imageFiles.filter((file) =>
        file.startsWith(`dall-${dateString}`)
      );

      // Set the index for the new file
      let nextIndex = 1;

      if (matchingFiles.length > 0) {
        const existingIndexes = matchingFiles
          .map((file) => {
            const match = file.match(/-(\d{2})\.webp/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .sort((a, b) => b - a);
        nextIndex = existingIndexes[0] + 1;
      }

      const paddedIndex =
        nextIndex === 1 ? "" : `-${String(nextIndex).padStart(2, "0")}`;

      // Set the file name
      let fileName;
      if (!paddedIndex) {
        fileName = `dall-${dateString}.webp`;
      } else {
        fileName = `dall-${dateString}-${paddedIndex}.webp`;
      }
      const filePath = path.join(outputDir, fileName);

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
