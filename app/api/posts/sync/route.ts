import sitemap from "@/app/sitemap";
import { checkBearerAuth } from "@/lib/auth";
import { upsertPost } from "@/lib/postgres/posts";
import { NextRequest, NextResponse } from "next/server";

function parsePostUrl(url: string) {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;
    const [, classification, category, slug] = parts;
    if (!classification || !category || !slug) return null;
    return { classification, category, slug };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  let sitemapEntries = [];
  try {
    sitemapEntries = await sitemap();
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "sitemap 생성 실패", detail: String(e) },
      { status: 500 },
    );
  }

  let insertCount = 0;
  for (const entry of sitemapEntries) {
    const info = parsePostUrl(entry.url);
    if (info) {
      await upsertPost(info);
      insertCount++;
    }
  }

  return NextResponse.json({
    ok: true,
    inserted: insertCount,
  });
}
