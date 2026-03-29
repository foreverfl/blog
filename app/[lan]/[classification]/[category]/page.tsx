import CategoryEmpty from "@/components/organism/CategoryEmpty";
import CategoryTrends from "@/components/organism/CategoryTrends";
import CategoryContent from "@/components/template/CategoryContent";
import { getContentsStructure } from "@/lib/content/jsonHelpers";

export default async function Index({
  params,
}: {
  params: Promise<{ classification: string; category: string }>;
}) {
  const { classification, category } = await params;

  if (classification === "trends") {
    const jsonContents = await getContentsStructure(category);
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
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <CategoryContent />
      </div>
    </div>
  );
}
