import { NextResponse } from "next/server";
import { getCommentsForPost } from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pathHash = searchParams.get("pathHash"); // 쿼리 파라미터에서 pathHash 가져오기

  if (!pathHash) {
    return NextResponse.json(
      { error: "pathHash is required" },
      { status: 400 }
    );
  }

  const comments = await getCommentsForPost(pathHash);
  return NextResponse.json(comments);
}
