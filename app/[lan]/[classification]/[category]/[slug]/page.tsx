import Comment from "@/components/molecules/Comment";
import Good from "@/components/molecules/Good";
import Article from "@/components/molecules/Article";
import SlugContent from "@/components/template/SlugContent";
import { getContents } from "@/lib/content/jsonHelpers";
import "github-markdown-css";

export default async function Page({
  params,
}: {
  params: Promise<{
    classification: string;
    category: string;
    slug: string;
  }>;
}) {
  const { classification, category, slug } = await params;

  if (classification === "trends") {
    const content = await getContents(category, slug);
    return (
      <>
        <Article trendsPage={true} content={content} />
        <Good />
        <Comment />
      </>
    );
  }

  return <SlugContent />;
}
