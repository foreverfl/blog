import Providers from "@/components/Providers";
import MapContent from "@/components/template/map/MapContent";

// Single React island for the admin-only /map page.
export default function MapIsland() {
  return (
    <Providers>
      <MapContent />
    </Providers>
  );
}
