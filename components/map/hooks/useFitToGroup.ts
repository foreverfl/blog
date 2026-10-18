import type { Place, PlaceGroup } from "@/lib/map/places";
import { LngLatBounds, type Map } from "maplibre-gl";
import { useEffect, useRef } from "react";

/**
 * Fits the map around the group's places once they are loaded, and again
 * only when the group changes. Chip filters and record saves leave the zoom alone.
 *
 * @param map - the MapLibre map, or null until MapLibreMap hands it over
 * @param group - the dropdown group; a change triggers a new fit
 * @param places - every place of that group, before the chips filter it
 */
export function useFitToGroup(
  map: Map | null,
  group: PlaceGroup,
  places: Place[],
) {
  // The effect reads the latest places without re-running when they change.
  const placesRef = useRef(places);
  placesRef.current = places;
  const loaded = places.length > 0;

  useEffect(() => {
    if (!map || !loaded) return;
    const bounds = placesRef.current.reduce(
      (acc, place) => acc.extend([place.lng, place.lat]),
      new LngLatBounds(),
    );
    map.fitBounds(bounds, { padding: 40, maxZoom: 12 });
  }, [map, group, loaded]);
}
