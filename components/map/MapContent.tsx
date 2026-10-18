import PlaceModal from "@/components/map/place/PlaceModal";
import MapLibreMap from "@/components/map/MapLibreMap";
import MapPanel from "@/components/map/MapPanel";
import PlaceSelect from "@/components/map/toolbar/PlaceSelect";
import PlaceTable from "@/components/map/place/PlaceTable";
import ViewToggle, { type MapView } from "@/components/map/toolbar/ViewToggle";
import { PLACES, type Place, type PlaceGroup } from "@/lib/map/places";
import { usePlacePins } from "@/components/map/hooks/usePlacePins";
import type { Map } from "maplibre-gl";
import { useState } from "react";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

/**
 * Map of Japan for anyone, with a dropdown that picks which group of places to pin.
 *
 * @returns the map panel with its toolbar, table view and place modal
 */
export default function MapContent() {
  const [map, setMap] = useState<Map | null>(null);
  const [group, setGroup] = useState<PlaceGroup>("its");
  const [view, setView] = useState<MapView>("map");
  const [selected, setSelected] = useState<Place | null>(null);
  usePlacePins(map, group, setSelected);

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
