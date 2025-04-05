import { checkBearerAuth } from "@/lib/auth";
import { putToR2 } from "@/lib/cloudflare/r2";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

/**
 * Get today's date in YYMMDD format (KST)
 */
function getTodayKST(): string {
  const now = new Date();
  now.setHours(now.getHours() + 9); // Adjust to KST (UTC+9)
  return now.toISOString().slice(2, 10).replace(/-/g, "");
}

/**
 * Generate a unique ID for each entry based on title
 */
function generateUUID(title: string): string {
  return createHash("sha256").update(title).digest("hex").slice(0, 16);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ date?: string }> }
) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const { date } = await params;
  const targetDate = date ?? getTodayKST(); // Default to today if no date is provided

  try {
    // Fetch the list of top story IDs from Hacker News
    console.log("🔄 Fetching new data from HackerNews API...");
    const topStoriesRes = await fetch(`${HN_API_BASE}/topstories.json`);
    const topStoryIds: number[] = await topStoriesRes.json();
    const top100Stories = topStoryIds.slice(0, 100);

    // Fetch detailed information for each story (parallel requests)
    const newsPromises = top100Stories.map(async (id) => {
      const newsRes = await fetch(`${HN_API_BASE}/item/${id}.json`);
      const newsData = await newsRes.json();

      return {
        id: generateUUID(newsData.title),
        title: {
          en: newsData.title,
          ko: null,
          ja: null,
        },
        type: newsData.type,
        url: newsData.url || null,
        score: newsData.score,
        by: newsData.by,
        time: newsData.time,
        content: null,
        summary: {
          en: null,
          ko: null,
          ja: null,
        },
      };
    });

    const news = await Promise.all(newsPromises);

    await putToR2({ bucket: "hackernews", key: `${targetDate}.json` }, news);
    console.log(`💾 Uploaded to R2: hackernews/${targetDate}.json`);

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching HackerNews data:", error);
    return NextResponse.json(
      { error: "Failed to fetch HackerNews data" },
      { status: 500 }
    );
  }
}
