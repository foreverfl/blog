import { checkBearerAuth } from "@/lib/auth";
import { requestGoogleIndexing } from "@/lib/google/indexing";
import { getUnindexedPosts, markPostsAsIndexed } from "@/lib/postgres/posts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  // Fetch unindexed posts
  const unindexedPosts = await getUnindexedPosts(1, 2);
  if (unindexedPosts.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "There are no unindexed posts.",
    });
  }

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
    processedCount: unindexedPosts.length,
    indexingResults,
  });
}
