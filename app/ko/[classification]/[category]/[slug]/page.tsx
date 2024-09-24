import fs from "fs";
import path from "path";
import mdxFiles from "@/contents/mdxFiles";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import "github-markdown-css";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

function getMdxFileContent(
  classification: string,
  category: string,
  slug: string
) {
  const filePath = path.join(
    process.cwd(),
    `contents/ko/${classification}/${category}/${slug}.mdx`
  );

  // MDX 파일 내용을 읽음
  const fileContent = fs.readFileSync(filePath, "utf8");
  return fileContent;
}

export default async function Page({
  params,
}: {
  params: {
    classification: string;
    category: string;
    slug: string;
  };
}) {
  const { classification, category, slug } = params;

  const markdownFilePath = `ko/${classification}/${category}/${slug}`;
  const MarkdownComponent = mdxFiles[markdownFilePath];

  if (!MarkdownComponent) {
    notFound(); // 컴포넌트가 없을 경우 처리
  }

  const fileContent = getMdxFileContent(classification, category, slug);

  // MDX 컴파일 시 코드 하이라이팅 추가
  const { content, frontmatter } = await compileMDX<{
    title: string;
    date: string;
    image: string;
  }>({
    source: fileContent,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm], // GitHub Flavored Markdown 사용
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: "github-light", // 원하는 테마 설정
            },
          ],
        ],
      },
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="markdown-body w-full md:w-3/5">
        <div className="my-56"></div>
        {content}
        <div className="my-56"></div>
      </div>
    </div>
  );
}
