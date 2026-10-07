import PlaceModal from "@/components/map/place/PlaceModal";
import MapLibreMap from "@/components/map/MapLibreMap";
import MapPanel from "@/components/map/MapPanel";
import PlaceSelect from "@/components/map/toolbar/PlaceSelect";
import PlaceTable from "@/components/map/place/PlaceTable";
import ViewToggle, { type MapView } from "@/components/map/toolbar/ViewToggle";
import { useAuth } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";
import { PLACES, type Place, type PlaceGroup } from "@/lib/map/places";
import { usePlacePins } from "@/components/map/hooks/usePlacePins";
import type { Map } from "maplibre-gl";
import { useState } from "react";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

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
  const [view, setView] = useState<MapView>("map");
  const [selected, setSelected] = useState<Place | null>(null);
  usePlacePins(map, group, setSelected);

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
    <MapPanel
      toolbar={
        <>
          <PlaceSelect value={group} onChange={setGroup} />
          <ViewToggle value={view} onChange={setView} />
        </>
      }
    >
      {/* Both stay mounted; hiding instead of unmounting keeps the map tiles and position. */}
      <div className={view === "map" ? "h-full" : "hidden"}>
        <MapLibreMap center={JAPAN_CENTER} zoom={JAPAN_ZOOM} onMap={setMap} />
      </div>
      <div className={view === "table" ? "h-full" : "hidden"}>
        <PlaceTable
          places={PLACES.filter((place) => place.group === group)}
          onSelect={setSelected}
        />
      </div>
      <PlaceModal place={selected} onClose={() => setSelected(null)} />
    </MapPanel>
  );
}
