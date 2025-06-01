import { NextRequest, NextResponse } from "next/server";
import { getLikeCountForPost } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pathHash = searchParams.get("pathHash");

  if (!pathHash) {
    return NextResponse.json(
      { error: "pathHash is required" },
      { status: 400 },
    );
  }

  try {
    const likeCount = await getLikeCountForPost(pathHash);
    return NextResponse.json({ likeCount }, { status: 200 });
  } catch (error) {
    console.error("Error getting like count:", error);
    return NextResponse.json(
      { error: "Failed to get like count" },
      { status: 500 },
    );
  }
}
