import sitemap from "@/app/sitemap";
import { checkBearerAuth } from "@/lib/auth";
import { requestGoogleIndexing } from "@/lib/google/indexing";
import {
  getUnindexedPosts,
  markPostsAsIndexed,
  upsertPost,
} from "@/lib/postgres/posts";
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
      { ok: false, error: "Failed to generate sitemap", detail: String(e) },
      { status: 500 },
    );
  }

  // Parse and insert posts from sitemap
  let insertCount = 0;
  for (const entry of sitemapEntries) {
    const info = parsePostUrl(entry.url);
    if (info) {
      await upsertPost(info);
      insertCount++;
    }
  }

  // Fetch unindexed posts
  const unindexedPosts = await getUnindexedPosts(1, 2);
  if (unindexedPosts.length === 0) {
    return NextResponse.json({
      ok: true,
      inserted: insertCount,
      message: "There are no unindexed posts.",
    });
  }

  console.log("unindexedPosts: ", unindexedPosts);

  // Invoke Google Indexing API and mark post as indexed
  const locales = ["ko", "ja"];
  const base = "https://mogumogu.dev";
  const indexingResults = [];

  for (const post of unindexedPosts) {
    const urls = locales.map(
      (lan) =>
        `${base}/${lan}/${post.classification}/${post.category}/${post.slug}`,
    );
    const results = await Promise.all(
      urls.map((url) => requestGoogleIndexing(url)),
    );
    const allSuccess = results.every((r) => r.ok);
    if (allSuccess) {
      await markPostsAsIndexed([post.id]);
    }
    indexingResults.push({
      postId: post.id,
      urls: urls.map((url, i) => ({
        url,
        result: results[i],
      })),
      allSuccess,
    });
  }

  return NextResponse.json({
    ok: true,
    inserted: insertCount,
    processedCount: unindexedPosts.length,
    indexingResults,
  });
}
