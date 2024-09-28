import fs from "fs";
import path from "path";
import React from "react";
import Category from "@/components/main/Category";
import { compileMDX } from "next-mdx-remote/rsc";

interface FrontMatter {
  fileName: string;
  title: string;
  date: string;
  classification: string;
  category: string;
  image: string;
}

interface MDXFrontMatter {
  title: string;
  date: string;
  classification: string;
  category: string;
  image: string;
}

async function getAllPostFrontMatters(
  classification: string,
  category: string
): Promise<FrontMatter[]> {
  // 디렉터리 내 모든 파일 이름 읽기
  const contentDirectory = path.join(
    process.cwd(),
    `contents/ko/${classification}/${category}`
  );

  const fileNames = fs.readdirSync(contentDirectory);

  // 파일 이름으로 프론트매터 배열 생성
  const frontMatters: FrontMatter[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(contentDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, "utf8");

    const { frontmatter } = await compileMDX<MDXFrontMatter>({
      source: fileContents,
      options: { parseFrontmatter: true },
    });

    frontMatters.push({
      fileName: path.basename(filePath),
      title: frontmatter.title || "No title",
      date: frontmatter.date || "No date",
      classification: frontmatter.classification || "No classification",
      category: frontmatter.category || "No category",
      image: frontmatter.image || "No image",
    });
  }

  return frontMatters;
}

export default async function Index({
  params,
}: {
  params: { classification: string; category: string };
}) {
  const { classification, category } = params;

  const frontMatters = await getAllPostFrontMatters(classification, category);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <Category posts={frontMatters} />
      </div>
    </div>
  );
}
