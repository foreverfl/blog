import { checkBearerAuth } from "@/lib/auth";
import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { fetchArxivAbstract } from "@/lib/hackernews/fetchArxiv";
import { fetchContent } from "@/lib/hackernews/fetchContent";
import { fetchEconomistContent } from "@/lib/hackernews/fetchEconomist";
import { fetchPdfContent } from "@/lib/hackernews/fetchPdfContent";
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import { sliceTextByTokens } from "@/lib/text";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date?: string }> }
) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const { date } = await params;
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  const dateKey = date ?? new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const key = `${dateKey}.json`;

  let dailyData = await getFromR2({ bucket: "hackernews", key });
  if (!dailyData) {
    return NextResponse.json({ ok: false, error: "Daily file not found in R2" });
  }

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
    } else {
      content = await fetchContent(foundItem.url);
      console.log(`🌐 Smart content fetched for ${foundItem.url}`);
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
  await putToR2({ bucket: "hackernews", key }, dailyData);
  
  return NextResponse.json(dailyData[existingIndex]);
}
