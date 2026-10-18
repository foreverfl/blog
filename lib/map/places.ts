export type PlaceGroup = "its" | "ur" | "brewery";

export type PlaceCategory =
  "ur" | "brewery" | "food" | "cafe" | "stay" | "sight" | "other";

/** One row of GET /places. The ITS-only fields (kind … closed) are null for other places. */
export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  subcategory: string | null;
  address: string | null;
  lat: number;
  lng: number;
  visitable: boolean | null;
  /** YYYY-MM-DD, or null when not visited yet. */
  visited_on: string | null;
  note: string | null;
  /** The official site, or a Google Maps link. */
  url: string | null;
  /** One representative photo on the blog asset bucket. */
  image_url: string | null;
  kind: "direct" | "yearround" | "seasonal" | null;
  seasons: string[] | null;
  prefecture: string | null;
  city: string | null;
  room_types: string | null;
  min_party: number | null;
  /** The ITS page for the facility. */
  detail_url: string | null;
  market_price_yen: number | null;
  closed: boolean | null;
  /** My record from GET /places/mine, merged by place_id; absent when logged out or never saved. */
  applied_count?: number;
  last_applied_on?: string | null;
  visited_with?: string | null;
  review?: string | null;
};

/** One row of GET /places/mine. */
export type PlaceVisit = {
  place_id: string;
  applied_count: number;
  last_applied_on: string | null;
  visited_on: string | null;
  visited_with: string | null;
  review: string | null;
};

/** The body of PUT /places/{id}/mine: a PlaceVisit without its place_id. */
export type PlaceVisitBody = Omit<PlaceVisit, "place_id">;

/** The dropdown groups; labelKey is a locale key. */
export const PLACE_GROUPS: { value: PlaceGroup; labelKey: string }[] = [
  { value: "its", labelKey: "map_group_its" },
  { value: "ur", labelKey: "map_group_ur" },
  { value: "brewery", labelKey: "map_group_brewery" },
];

/** The chip row under the dropdown; an empty subcategories list means every subcategory. */
export type PlaceFilter = {
  visitableOnly: boolean;
  visitedOnly: boolean;
  subcategories: string[];
};

export const NO_FILTER: PlaceFilter = {
  visitableOnly: false,
  visitedOnly: false,
  subcategories: [],
};

/**
 * Copy my visit records onto the places they belong to.
 *
 * @param places - every row of GET /places
 * @param visits - my rows of GET /places/mine, [] when logged out
 * @returns the same places; a place with a visit also carries visited_on from it
 */
export function mergeVisits(places: Place[], visits: PlaceVisit[]): Place[] {
  const byPlaceId = new Map(visits.map((visit) => [visit.place_id, visit]));
  return places.map((place) => {
    const visit = byPlaceId.get(place.id);
    if (!visit) return place;
    const { place_id: _placeId, ...mine } = visit;
    return {
      ...place,
      ...mine,
      visited_on: mine.visited_on ?? place.visited_on,
    };
  });
}

/**
 * Whether a place belongs to the dropdown group.
 *
 * @param group - "its" | "ur" | "brewery"
 * @param place - a merged place
 * @returns true for the ITS subcategory or the ur / brewery category
 */
export function inGroup(group: PlaceGroup, place: Place): boolean {
  if (group === "its") return place.subcategory === "its";
  return place.category === group;
}

/**
 * Whether a place passes every chip that is switched on.
 *
 * @param filter - the chip row state
 * @param place - a merged place
 * @returns false as soon as one chip rules the place out
 */
export function passesFilter(filter: PlaceFilter, place: Place): boolean {
  if (filter.visitableOnly && place.visitable !== true) return false;
  if (filter.visitedOnly && place.visited_on === null) return false;
  if (
    filter.subcategories.length > 0 &&
    !filter.subcategories.includes(place.subcategory ?? "")
  )
    return false;
  return true;
}

/**
 * The distinct subcategories among the given places, for the chip row.
 *
 * @param places - the places of the chosen group
 * @returns sorted names, e.g. ["gin", "whisky"]; [] when none has one
 */
export function subcategoriesOf(places: Place[]): string[] {
  const names = new Set<string>();
  for (const place of places) {
    if (place.subcategory) names.add(place.subcategory);
  }
  return [...names].sort();
}
