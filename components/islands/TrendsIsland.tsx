import Providers from "@/components/Providers";
import TrendsContent from "@/components/template/TrendsContent";

// Single React island for a trends (hackernews) detail page.
export default function TrendsIsland() {
  return (
    <Providers>
      <TrendsContent />
    </Providers>
  );
}
