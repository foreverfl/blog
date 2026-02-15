import { checkBearerAuth } from "@/lib/auth";
import { syncAllPosts } from "@/lib/postgres/sync-posts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  try {
    const insertCount = await syncAllPosts();
    return NextResponse.json({
      ok: true,
      inserted: insertCount,
      message: "Sync completed. Posts are upserted.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Failed to sync posts", detail: String(e) },
      { status: 500 },
    );
  }
}
