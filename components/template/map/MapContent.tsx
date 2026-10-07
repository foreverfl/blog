import MapLibreMap from "@/components/organism/map/MapLibreMap";
import { useAuth } from "@/lib/context/auth-context";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

/**
 * Admin-only full-screen map of Japan with nothing on it yet.
 *
 * @returns the map for an admin, a not-found line for everyone else
 */
export default function MapContent() {
  const { isReady, isAdmin } = useAuth();

  if (!isReady) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p>Page not found</p>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full">
      <MapLibreMap center={JAPAN_CENTER} zoom={JAPAN_ZOOM} />
    </div>
  );
}
