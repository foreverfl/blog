import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { logMessage } from "@/lib/logger";
import { draw } from "@/lib/openai/draw";
import { drawQueue } from "@/lib/queue";
import axios from "axios";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> },
) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  const { date } = await params;

  // Date formatting
  const dateString = date ?? getTodayKST();

  // Read data from the file based on R2
  const key = `${dateString}.json`;
  const bucket = "hackernews";
  const items = await getFromR2({ bucket, key });

  if (!items) {
    return NextResponse.json({
      ok: false,
      error: "❌ No data found for the given date in R2",
    });
  }

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
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const webpBuffer = await sharp(response.data).webp().toBuffer();

      const key = `${dateString}.webp`;
      const bucket = "hackernews-images";

      await putToR2({ bucket, key }, webpBuffer);
      logMessage(`✅ Uploaded image to R2: ${bucket}/${key}`);
    } catch (err) {
      console.error("❌ Failed to generate or save image in queue:", err);
    }
  });

  return NextResponse.json({
    ok: true,
    message: "Image generation request queued.",
  });
}
