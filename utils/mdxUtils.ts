import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

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
export async function getPostFrontMatter(
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

    return {
      fileName: `${slug}.mdx`,
      title: frontmatter.title || "No title",
      date: frontmatter.date || "No date",
      image: frontmatter.image || "No image",
    };
  } catch (error) {
    console.error("Error reading file or parsing MDX:", error);
    return null;
  }
}
