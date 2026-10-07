import MapLibreMap from "@/components/organism/map/MapLibreMap";
import PlaceSelect from "@/components/organism/map/PlaceSelect";
import { useAuth } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";
import { PLACES, type PlaceGroup } from "@/lib/map/places";
import { LngLatBounds, type Map, Marker } from "maplibre-gl";
import { useEffect, useState, type ReactNode } from "react";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

/**
 * Toolbar row plus a rounded panel under the fixed navbar (pt-20 like every
 * other page); the panel holds either the map or the sign-in prompt.
 *
 * @param props - { toolbar: controls above the panel, children: what goes inside it }
 * @returns the panel, centered and 70% of the viewport tall
 */
function MapPanel({
  toolbar,
  children,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="px-4 pt-20 pb-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <div className="h-[70dvh] w-full overflow-hidden rounded-xl border border-gray-700 shadow-lg dark:border-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Drops one pin per place of the chosen group and fits the map around them.
 *
 * @param map - the MapLibre map, or null until MapLibreMap hands it over
 * @param group - "its" | "ur" | "visited"
 */
function usePlacePins(map: Map | null, group: PlaceGroup) {
  useEffect(() => {
    if (!map) return;
    const places = PLACES.filter((place) => place.group === group);
    const pins = places.map((place) =>
      new Marker().setLngLat([place.lng, place.lat]).addTo(map),
    );
    const bounds = places.reduce(
      (acc, place) => acc.extend([place.lng, place.lat]),
      new LngLatBounds(),
    );
    map.fitBounds(bounds, { padding: 40, maxZoom: 12 });

    return () => {
      pins.forEach((pin) => pin.remove());
    };
  }, [map, group]);
}

/**
 * Map of Japan for anyone who is signed in, with a dropdown that picks which
 * group of places to pin.
 *
 * @returns the map when signed in, otherwise a sign-in prompt
 */
export default function MapContent() {
  const { isReady, isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [map, setMap] = useState<Map | null>(null);
  const [group, setGroup] = useState<PlaceGroup>("its");
  usePlacePins(map, group);

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
    <MapPanel toolbar={<PlaceSelect value={group} onChange={setGroup} />}>
      <MapLibreMap center={JAPAN_CENTER} zoom={JAPAN_ZOOM} onMap={setMap} />
    </MapPanel>
  );
}
