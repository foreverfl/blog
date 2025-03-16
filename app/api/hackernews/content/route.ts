import { NextResponse } from "next/server";
import { fetchContentFromUrl } from "@/lib/hackernewsUtils"; 

export async function POST(req: Request) {
    try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    console.log("Fetching content for URL:", url);
    
    const content = await fetchContentFromUrl(url);
    
    return NextResponse.json({ url, content });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}