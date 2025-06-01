import Category from "@/components/main/Category";
import CategoryTrends from "@/components/main/CategoryTrends";
import { getContentsStructure } from "@/lib/content/jsonHelpers";
import { getAllPostFrontMatters } from "@/lib/content/mdxHelpers";
import { cookies } from "next/headers";

export default async function Index({
  params,
}: {
  params: Promise<{ classification: string; category: string }>;
}) {
  const cookieStore = await cookies();
  const lan = cookieStore.get("lan")?.value || "en";
  const { classification, category } = await params;

  const frontMatters = await getAllPostFrontMatters(
    lan,
    classification,
    category
  );

  const jsonContents =
    classification === "trends" ? await getContentsStructure(category) : [];
    
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
