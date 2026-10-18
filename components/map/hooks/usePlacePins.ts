import type { Place } from "@/lib/map/places";
import { LngLatBounds, type Map, Marker } from "maplibre-gl";
import { useEffect } from "react";

// Pin colors: visited places in the site blue, the rest gray.
const VISITED_PIN = "#3b82f6";
const UNVISITED_PIN = "#9ca3af";

/**
 * Drops one pin per place, gray until visited, and fits the map around them.
 *
 * @param map - the MapLibre map, or null until MapLibreMap hands it over
 * @param places - the places of the chosen group; nothing is drawn while empty
 * @param onSelect - called with the place whose pin was clicked
 */
export function usePlacePins(
  map: Map | null,
  places: Place[],
  onSelect: (place: Place) => void,
) {
  useEffect(() => {
    if (!map || places.length === 0) return;
    const pins = places.map((place) => {
      const pin = new Marker({
        color: place.visited_on ? VISITED_PIN : UNVISITED_PIN,
      })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      pin.getElement().style.cursor = "pointer";
      pin.getElement().addEventListener("click", () => onSelect(place));
      return pin;
    });
    const bounds = places.reduce(
      (acc, place) => acc.extend([place.lng, place.lat]),
      new LngLatBounds(),
    );
    map.fitBounds(bounds, { padding: 40, maxZoom: 12 });

    return () => {
      pins.forEach((pin) => pin.remove());
    };
  }, [map, places, onSelect]);
}
