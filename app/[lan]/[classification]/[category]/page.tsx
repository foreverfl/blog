import Category from "@/components/organism/Category";
import CategoryEmpty from "@/components/organism/CategoryEmpty";
import CategoryTrends from "@/components/organism/CategoryTrends";
import { getContentsStructure } from "@/lib/content/jsonHelpers";
import { FrontMatter, getAllPostFrontMatters } from "@/lib/content/mdxHelpers";
import { cookies } from "next/headers";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full md:w-3/5">
          {!jsonContents || jsonContents.length === 0 ? (
            <CategoryEmpty categoryName="Trends" />
          ) : (
            <CategoryTrends jsonContents={jsonContents} />
          )}
        </div>
      </div>
    );
  } else {
    frontMatters = await getAllPostFrontMatters(lan, classification, category);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full md:w-3/5">
          {frontMatters.length === 0 ? (
            <CategoryEmpty categoryName={category} />
          ) : (
            <Category posts={frontMatters} />
          )}
        </div>
      </div>
    );
  }
}
