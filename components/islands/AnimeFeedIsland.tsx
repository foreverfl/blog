import Providers from "@/components/Providers";
import AnimeFeedContent from "@/components/template/AnimeFeedContent";

// Single React island for the personal anime clip feed page.
export default function AnimeFeedIsland() {
  return (
    <Providers>
      <AnimeFeedContent />
    </Providers>
  );
}
