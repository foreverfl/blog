import Category from "@/components/main/Category";
import CategoryTrends from "@/components/main/CategoryTrends";
import { getContentsStructure } from "@/lib/content/jsonHelpers";
import { FrontMatter, getAllPostFrontMatters } from "@/lib/content/mdxHelpers";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Index({
  params,
}: {
  params: Promise<{ classification: string; category: string }>;
}) {
  const cookieStore = await cookies();
  const lan = cookieStore.get("lan")?.value || "en";
  const { classification, category } = await params;

  let frontMatters: FrontMatter[] = [];
  let jsonContents: Array<{ folder: string; dates: string[] }> = [];

  if (classification === "trends") {
    jsonContents = await getContentsStructure(category);
    if (!jsonContents || jsonContents.length === 0) {
      notFound();
    }
  } else {
    frontMatters = await getAllPostFrontMatters(lan, classification, category);
    if (frontMatters.length === 0) {
      notFound();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        {classification === "trends" ? (
          <CategoryTrends jsonContents={jsonContents} />
        ) : (
          <Category posts={frontMatters} />
        )}
      </div>
    </div>
  );
}
