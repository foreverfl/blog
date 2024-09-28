import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { NextResponse } from "next/server";
import { format, toZonedTime } from "date-fns-tz";

interface FrontMatter {
  fileName: string;
  title: string;
  date: string;
  image: string;
}

interface MDXFrontMatter {
  title: string;
  date: string;
  image: string;
}

// 메타데이터 반환 함수
async function getPostFrontMatter(
  lan: string,
  classification: string,
  category: string,
  slug: string
): Promise<FrontMatter | null> {
  try {
    // 파일 경로 설정
    const filePath = path.join(
      process.cwd(),
      `contents/${lan}/${classification}/${category}/${slug}.mdx`
    );

    // 파일 읽기
    const fileContents = fs.readFileSync(filePath, "utf8");

    // MDX에서 frontmatter 파싱
    const { frontmatter } = await compileMDX<MDXFrontMatter>({
      source: fileContents,
      options: { parseFrontmatter: true },
    });

    const utcDate = new Date(frontmatter.date);
    const kstDate = toZonedTime(utcDate, "Asia/Seoul");
    const formattedKSTDate = format(kstDate, "yyyy-MM-dd HH:mm:ss");

    return {
      fileName: `${slug}.mdx`,
      title: frontmatter.title || "No title",
      date: formattedKSTDate || "No date",
      image: frontmatter.image || "No image",
    };
  } catch (error) {
    console.error("Error reading file or parsing MDX:", error);
    return null;
  }
}

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
