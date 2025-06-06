import { getPostFrontMatter } from "@/lib/content/mdxHelpers";
import { NextResponse } from "next/server";
import { parse, format } from "date-fns";

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
      { status: 400 },
    );
  }

  const trendsPage = classification === "trends";

  let hackerNewsTitle = "Hacker News Digest"; // 기본값

  if (lan === "ja") {
    hackerNewsTitle = "ハッカーニュースダイジェスト";
  } else if (lan === "ko") {
    hackerNewsTitle = "해커뉴스 다이제스트";
  }

  if (trendsPage) {
    try {
      // 날짜 포맷 변경 (250327 -> 2025-03-27)
      const parsedDate = parse(slug, "yyMMdd", new Date());
      const formattedDate = format(parsedDate, "yyyy-MM-dd");

      // trends response
      return NextResponse.json({
        title: hackerNewsTitle,
        date: formattedDate,
        classification: "trends",
        category: "hackernews",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Trend data not found" },
        { status: 404 },
      );
    }
  } else {
    // 프론트매터 메타데이터 가져오기
    const frontMatter = await getPostFrontMatter(
      lan,
      classification,
      category,
      slug,
    );

    // 메타데이터 반환 또는 404 처리
    if (frontMatter) {
      return NextResponse.json(frontMatter);
    } else {
      return NextResponse.json({ error: "Post not found" });
    }
  }
}
