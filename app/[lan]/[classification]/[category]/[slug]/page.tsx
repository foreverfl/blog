import Comment from "@/components/molecules/Comment";
import Good from "@/components/molecules/Good";
import Article from "@/components/molecules/Article";
import { getContents } from "@/lib/content/jsonHelpers";
import { compileMdxContent, getMdxFileContent } from "@/lib/content/mdxHelpers";
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
  if (classification === "trends") {
    const jsonContents = await getContents(category, slug);
    content = jsonContents;
  } else {
    const fileContent = getMdxFileContent(
      lan ?? "en",
      classification,
      category,
      slug + "-" + (lan ?? "en"),
    );
    if (!fileContent) {
      notFound();
    }
    const { content: mdxContent } = await compileMdxContent(fileContent);
    if (!mdxContent) {
      notFound();
    }
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
