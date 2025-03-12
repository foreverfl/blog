import { NextResponse } from "next/server";
import { getAllMdxFilesWithFrontMatter } from "@/lib/mdxHelpers";

export async function GET(req: Request) {
  // URL에서 쿼리 파라미터를 가져옴
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lan") || "ko"; // 기본 값은 'ko'
  const classification = searchParams.get("classification");
  const category = searchParams.get("category");

  const posts = await getAllMdxFilesWithFrontMatter(
    lang,
    classification!,
    category!
  );

  return NextResponse.json(posts);
}
