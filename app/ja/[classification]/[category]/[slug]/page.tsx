import mdxFiles from "@/contents/mdxFiles";
import { notFound } from "next/navigation";
import "github-markdown-css";
import { compileMdxContent, getMdxFileContent } from "@/lib/mdxHelpers";
import { cookies } from "next/headers";

export default async function Page({
  params,
}: {
  params: {
    classification: string;
    category: string;
    slug: string;
  };
}) {
  const cookieStore = cookies();
  const lan = cookieStore.get("lan")?.value || "ja";
  const { classification, category, slug } = params;

  const markdownFilePath = `ja/${classification}/${category}/${slug}`;
  const MarkdownComponent = mdxFiles[markdownFilePath];

  if (!MarkdownComponent) {
    notFound(); // 컴포넌트가 없을 경우 처리
  }

  const fileContent = getMdxFileContent(lan, classification, category, slug);
  const { content } = await compileMdxContent(fileContent);

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
