import Providers from "@/components/Providers";
import AnimeAppContent from "@/components/template/AnimeAppContent";

// Single React island for the personal anime clip feed page.
export default function AnimeFeedIsland() {
  return (
    <Providers>
      <AnimeAppContent />
    </Providers>
  );
}
