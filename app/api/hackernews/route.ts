import { checkBearerAuth } from "@/lib/auth";
import { createHash } from "crypto";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";
const HN_DIR = path.join(process.cwd(), "contents", "trends", "hackernews");
const FILE_PATH = path.join(HN_DIR, `${getTodayKST()}.json`);

if (!fs.existsSync(HN_DIR)) {
  fs.mkdirSync(HN_DIR);
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

/**
 * Load data from file if exists
 */
function loadFromFile(filePath: string): any | null {
  if (fs.existsSync(filePath)) {
    console.log(`📂 Loading cached data from ${filePath}`);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return null;
}

export async function GET(req: Request) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult; 
  }

  try {
    // Check if the data is already cached for today
    const todayFilePath = path.join(HN_DIR, `${getTodayKST()}.json`);

    if (!fs.existsSync(HN_DIR)) {
      fs.mkdirSync(HN_DIR, { recursive: true });
    }

    const cachedData = loadFromFile(todayFilePath);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

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
        }
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
