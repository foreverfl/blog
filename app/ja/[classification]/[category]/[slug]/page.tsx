import { notFound } from "next/navigation";
import "github-markdown-css";
import { compileMdxContent, getMdxFileContent } from "@/lib/mdxHelpers";
import Good from "@/components/main/Good";
import Comment from "@/components/main/Comment";
import { cookies } from "next/headers";
import { getContents } from "@/lib/jsonHelpers";

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="markdown-body w-full md:w-3/5">
        <div className="my-56"></div>
        {content}
        <div className="my-56"></div>
        <Good />
        <Comment />
      </div>
    </div>
  );
}
