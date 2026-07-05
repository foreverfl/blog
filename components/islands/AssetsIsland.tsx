import Providers from "@/components/Providers";
import AssetsContent from "@/components/template/AssetsContent";

// Single React island for the admin asset file manager page.
export default function AssetsIsland() {
  return (
    <Providers>
      <AssetsContent />
    </Providers>
  );
}
