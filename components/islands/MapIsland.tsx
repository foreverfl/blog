import Providers from "@/components/Providers";
import MapContent from "@/components/map/MapContent";

// Single React island for the /{lan}/map page.
export default function MapIsland({ lan }: { lan: string }) {
  return (
    <Providers>
      <MapContent lan={lan} />
    </Providers>
  );
}
