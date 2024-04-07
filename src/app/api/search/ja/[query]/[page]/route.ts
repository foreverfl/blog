import { getPostsByContentJa } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { query: string; page: string } }
) {
  const contentQuery = params.query;
  const pageNumber = parseInt(params.page, 10);
  const itemsPerPage = 12; // 페이지 당 항목 수

  try {
    // 검색 쿼리에 따른 포스트 가져오기
    const { posts, total } = await getPostsByContentJa(
      contentQuery,
      pageNumber,
      itemsPerPage
    );

    // 응답 데이터 생성
    const responseBody = JSON.stringify({
      posts,
      pagination: {
        page: pageNumber,
        itemsPerPage,
        totalItems: total,
        totalPages: Math.ceil(total / itemsPerPage),
      },
    });

    return new NextResponse(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
