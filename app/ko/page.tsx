import fs from "fs";
import path from "path";
import React from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import AllCategory from "@/components/main/AllCategory";

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

// 재귀적으로 폴더를 탐색하며 .mdx 파일 찾기
async function getFilesRecursively(dir: string): Promise<string[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries
    .filter((file) => !file.isDirectory() && file.name.endsWith(".mdx"))
    .map((file) => path.join(dir, file.name));
  const folders = entries.filter((folder) => folder.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(dir, folder.name);
    const folderFiles = await getFilesRecursively(folderPath);
    files.push(...folderFiles);
  }

  return files;
}

async function getAllPostFrontMatters(): Promise<FrontMatter[]> {
  // 최상위 디렉터리 지정
  const contentDirectory = path.join(process.cwd(), `contents/ko/`);

  // 재귀적으로 모든 .mdx 파일 찾기
  const filePaths = await getFilesRecursively(contentDirectory);

  // 파일 이름으로 프론트매터 배열 생성
  const frontMatters: FrontMatter[] = [];

  for (const filePath of filePaths) {
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

export default async function Index() {
  const frontMatters = await getAllPostFrontMatters();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <AllCategory posts={frontMatters} />
      </div>
    </div>
  );
}
