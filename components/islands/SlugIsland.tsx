import Providers from "@/components/Providers";
import SlugContent from "@/components/template/SlugContent";

// Single React island for a post detail page: wraps the content (which uses
// auth / react-query / login-modal / i18n context) in the shared Providers tree.
export default function SlugIsland() {
  return (
    <Providers>
      <SlugContent />
    </Providers>
  );
}
