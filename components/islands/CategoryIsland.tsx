import Providers from "@/components/Providers";
import CategoryContent from "@/components/template/CategoryContent";

// Single React island for a category listing page.
export default function CategoryIsland({
  lan,
  classification,
  category,
}: {
  lan: string;
  classification: string;
  category: string;
}) {
  return (
    <Providers>
      <CategoryContent
        lan={lan}
        classification={classification}
        category={category}
      />
    </Providers>
  );
}
