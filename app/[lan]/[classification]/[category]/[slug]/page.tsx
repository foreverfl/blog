import Comment from "@/components/main/Comment";
import Good from "@/components/main/Good";
import Article from "@/components/organism/Article";
import { getContents } from "@/lib/jsonHelpers";
import { compileMdxContent, getMdxFileContent } from "@/lib/mdxHelpers";
import "github-markdown-css";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{
    classification: string;
    category: string;
    slug: string;
  }>;
}) {
  const cookiesList = await cookies();
  const lan = cookiesList.get("lan")?.value;

  const { classification, category, slug } = await params;
  const trendsPage = classification === "trends";

  let content;

  if (trendsPage) {
    const jsonContents = await getContents(category, slug);
    content = jsonContents;
  } else {
    const markdownFilePath = `${classification}/${category}/${slug}-${lan}`;
    if (!markdownFilePath) {
      notFound(); // 컴포넌트가 없을 경우 처리
    }

    const fileContent = getMdxFileContent("ko", classification, category, slug);
    const { content: mdxContent } = await compileMdxContent(fileContent);
    content = mdxContent;
  }

  return (
    <>
      <Article trendsPage={trendsPage} content={content} />
      <Good />
      <Comment />
    </>
  );
}
