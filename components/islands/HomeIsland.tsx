import Providers from "@/components/Providers";
import HomeContent from "@/components/template/HomeContent";

// Single React island for the home page: wraps the content in the shared
// Providers tree (theme / react-query / auth / loading).
export default function HomeIsland({ lan }: { lan: string }) {
  return (
    <Providers>
      <HomeContent lan={lan} />
    </Providers>
  );
}
