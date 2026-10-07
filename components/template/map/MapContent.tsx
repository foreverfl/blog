import MapLibreMap from "@/components/organism/map/MapLibreMap";
import { useAuth } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

/**
 * Full-screen map of Japan for anyone who is signed in, with nothing on it yet.
 *
 * @returns the map when signed in, otherwise a sign-in prompt
 */
export default function MapContent() {
  const { isReady, isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();

  if (!isReady) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-sm opacity-70">Sign in to see the map</p>
        <button
          type="button"
          onClick={openLoginModal}
          className="rounded-full border px-6 py-2 font-semibold"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full">
      <MapLibreMap center={JAPAN_CENTER} zoom={JAPAN_ZOOM} />
    </div>
  );
}
