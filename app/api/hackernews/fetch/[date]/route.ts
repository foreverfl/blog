import { checkBearerAuth } from "@/lib/auth";
import { fetchContent } from "@/lib/hackernews/fetchContent";
import { fetchArxivAbstract } from "@/lib/hackernews/fetchArxiv";
import { fetchEconomistContent } from "@/lib/hackernews/fetchEconomist";
import { fetchPdfContent } from "@/lib/hackernews/fetchPdfContent";
import {
  getDailyFilePath,
  readJsonFile,
  writeJsonFile,
} from "@/lib/hackernews/fileUtils";
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import { NextResponse } from "next/server";
import {sliceTextByTokens} from "@/lib/text";

type FetchContentRequestBody = {
  id: string;
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

  if (!body.id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  const { id } = body;

  // Fetch from file
  const dailyFilePath = await getDailyFilePath("contents/trends/hackernews", date);
  let dailyData = await readJsonFile(dailyFilePath);

  const existingIndex = dailyData.findIndex(
    (item: { id: any }) => item.id === id
  );

  if (existingIndex === -1) {
    return NextResponse.json({ ok: false, error: "Item not found in daily data" });
  }

  if (dailyData[existingIndex].content) {
    console.log(`✅ Content already exists for ID: ${id}, skipping fetch.`);
    return NextResponse.json(dailyData[existingIndex]);
  }

  // Fetch from API
  const foundItem = await getHackernewsItemById(id);

  if (!foundItem || !foundItem.url) {
    return NextResponse.json({ ok: false, error: "Item or URL not found" });
  }

  let content: string | null | undefined = null;

  try {
    if (foundItem.url.includes(".pdf")) {
      content = await fetchPdfContent(foundItem.url);
      console.log(`📄 PDF content extracted for ${foundItem.url}`);
    } else if (foundItem.url.includes("arxiv.org")) {
      content = await fetchArxivAbstract(foundItem.url);
      console.log(`📚 Arxiv abstract fetched for ${foundItem.url}`);
    } else if (foundItem.url.includes("economist.com")) {
      content = await fetchEconomistContent(foundItem.url);
      console.log(`📚 Economist content fetched for ${foundItem.url}`);
    } else {
      content = await fetchContent(foundItem.url);
      console.log(`🌐 General content fetched for ${foundItem.url}`);
    }
    
    // Only slice if content exists
    if (content) {
      content = await sliceTextByTokens(content, 15000);
      console.log(`📄 Sliced content (up to 15000 tokens)`);
    }

  } catch (error) {
    console.error("❌ Error fetching content: ", error);
    return NextResponse.json({ ok: false, error: "Error fetching content" });
  }

  dailyData[existingIndex].content = content;

  await writeJsonFile(dailyFilePath, dailyData);

  const updatedItem = dailyData[existingIndex];
  
  return NextResponse.json(updatedItem);
}
