import { createHash } from "crypto";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";


const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";
const TMP_DIR = path.join(process.cwd(), "tmp");
const FILE_PATH = path.join(TMP_DIR, `${getTodayKST()}.json`);

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}

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

/**
 * Save fetched data to a JSON file
 */
function saveToFile(data: any) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}


export async function GET() {
  try {
    // 1. Fetch the list of top story IDs from Hacker News
    const topStoriesRes = await fetch(`${HN_API_BASE}/topstories.json`);
    const topStoryIds: number[] = await topStoriesRes.json();
    const top50Stories = topStoryIds.slice(0, 50); 

    // 3. Fetch detailed information for each story (parallel requests)
    const newsPromises = top50Stories.map(async (id) => {
      const newsRes = await fetch(`${HN_API_BASE}/item/${id}.json`);
      const newsData = await newsRes.json();

      return {
        id: generateUUID(newsData.title),
        title: newsData.title,
        type: newsData.type,
        url: newsData.url || null,
        score: newsData.score,
        by: newsData.by,
        time: newsData.time,
        content: null, 
      };
    });

    const news = await Promise.all(newsPromises);
    saveToFile(news);
    console.log("✅ HackerNews data saved:", FILE_PATH);    

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching HackerNews data:", error);
    return NextResponse.json(
      { error: "Failed to fetch HackerNews data" },
      { status: 500 }
    );
  }
}
