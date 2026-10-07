import MapLibreMap from "@/components/organism/map/MapLibreMap";
import { useAuth } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";
import type { ReactNode } from "react";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

/**
 * Rounded panel under the fixed navbar (pt-20 like every other page) that holds
 * either the map or the sign-in prompt.
 *
 * @param props - { children: what goes inside the panel }
 * @returns the panel, centered and 70% of the viewport tall
 */
function MapPanel({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pt-20 pb-16">
      <div className="mx-auto h-[70dvh] w-full max-w-5xl overflow-hidden rounded-xl border border-gray-700 shadow-lg dark:border-gray-600">
        {children}
      </div>
    </div>
  );
}

/**
 * Map of Japan for anyone who is signed in, with nothing on it yet.
 *
 * @returns the map when signed in, otherwise a sign-in prompt
 */
export default function MapContent() {
  const { isReady, isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();

  if (!isReady) return null;

  if (!isLoggedIn) {
    return (
      <MapPanel>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-sm opacity-70">Sign in to see the map</p>
          <button
            type="button"
            onClick={openLoginModal}
            className="rounded-full border px-6 py-2 font-semibold"
          >
            Sign in
          </button>
        </div>
      </MapPanel>
    );
  }

  return (
    <MapPanel>
      <MapLibreMap center={JAPAN_CENTER} zoom={JAPAN_ZOOM} />
    </MapPanel>
  );
}
