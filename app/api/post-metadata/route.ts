import { getPostFrontMatter } from "@/lib/mdxHelpers";
import { NextResponse } from "next/server";

// API route handler
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // 쿼리 파라미터 가져오기
  const lan = searchParams.get("lan");
  const classification = searchParams.get("classification");
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");

  // 필수 파라미터 확인
  if (!lan || !classification || !category || !slug) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  // 프론트매터 메타데이터 가져오기
  const frontMatter = await getPostFrontMatter(
    lan,
    classification,
    category,
    slug
  );

  // 메타데이터 반환 또는 404 처리
  if (frontMatter) {
    return NextResponse.json(frontMatter);
  } else {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}
