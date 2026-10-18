import PlaceModal from "@/components/map/place/PlaceModal";
import MapLibreMap from "@/components/map/MapLibreMap";
import MapPanel from "@/components/map/MapPanel";
import FilterChips from "@/components/map/toolbar/FilterChips";
import PlaceSelect from "@/components/map/toolbar/PlaceSelect";
import PlaceTable from "@/components/map/place/PlaceTable";
import ViewToggle, { type MapView } from "@/components/map/toolbar/ViewToggle";
import "@/lib/i18n";
import { useAuth } from "@/lib/context/auth-context";
import { listMyVisits, listPlaces } from "@/lib/map/api";
import {
  inGroup,
  mergeVisits,
  NO_FILTER,
  passesFilter,
  subcategoriesOf,
  type Place,
  type PlaceFilter,
  type PlaceGroup,
  type PlaceVisit,
} from "@/lib/map/places";
import { usePlacePins } from "@/components/map/hooks/usePlacePins";
import { useQuery } from "@tanstack/react-query";
import type { Map } from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// [lng, lat] over central Honshu; zoom 5 fits the whole country on a laptop.
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 5;

// One shared empty array: a fresh [] per render would recompute shown and refit the map on every click.
const NO_PLACES: Place[] = [];
const NO_VISITS: PlaceVisit[] = [];

/**
 * Map of Japan for anyone, with a dropdown that picks which group of places to pin.
 * Places come from GET /places; when signed in, my records from GET /places/mine
 * are merged onto them.
 *
 * @param props - { lan: "ko" | "en" | "ja" from the URL }
 * @returns the map panel with its toolbar, table view and place modal
 */
export default function MapContent({ lan }: { lan: string }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(lan);
  }, [lan, i18n]);
  const [map, setMap] = useState<Map | null>(null);
  const [group, setGroup] = useState<PlaceGroup>("its");
  const [filter, setFilter] = useState<PlaceFilter>(NO_FILTER);
  const [view, setView] = useState<MapView>("map");
  const [selected, setSelected] = useState<Place | null>(null);
  const { isLoggedIn } = useAuth();
  const { data: places = NO_PLACES } = useQuery({
    queryKey: ["places"],
    queryFn: listPlaces,
  });
  const { data: visits = NO_VISITS } = useQuery({
    queryKey: ["places", "mine"],
    queryFn: listMyVisits,
    enabled: isLoggedIn,
  });
  const grouped = useMemo(
    () => mergeVisits(places, visits).filter((place) => inGroup(group, place)),
    [places, visits, group],
  );
  const shown = useMemo(
    () => grouped.filter((place) => passesFilter(filter, place)),
    [grouped, filter],
  );
  const changeGroup = (next: PlaceGroup) => {
    setGroup(next);
    setFilter(NO_FILTER);
  };
  usePlacePins(map, shown, setSelected);
  // After a save the merged row changes; the modal must show that row, not the clicked snapshot.
  const selectedNow =
    shown.find((place) => place.id === selected?.id) ?? selected;

  return (
    <MapPanel
      toolbar={
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <PlaceSelect value={group} onChange={changeGroup} />
            <ViewToggle value={view} onChange={setView} />
          </div>
          <FilterChips
            subcategories={subcategoriesOf(grouped)}
            value={filter}
            onChange={setFilter}
          />
        </div>
      }
    >
      {/* Both stay mounted; hiding instead of unmounting keeps the map tiles and position. */}
      <div className={view === "map" ? "h-full" : "hidden"}>
        <MapLibreMap center={JAPAN_CENTER} zoom={JAPAN_ZOOM} onMap={setMap} />
      </div>
      <div className={view === "table" ? "h-full" : "hidden"}>
        <PlaceTable group={group} places={shown} onSelect={setSelected} />
      </div>
      <PlaceModal place={selectedNow} onClose={() => setSelected(null)} />
    </MapPanel>
  );
}
