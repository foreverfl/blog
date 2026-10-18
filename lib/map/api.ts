import { RUST_API } from "@/lib/api-base";
import { getValidAccessToken } from "@/lib/auth/token";
import type { Place, PlaceVisit } from "@/lib/map/places";
import { apiGet } from "@/lib/query/query";

/**
 * Every place on the map, ITS details included. Public.
 *
 * @returns places ordered by name
 */
export function listPlaces(): Promise<Place[]> {
  return apiGet<Place[]>(`${RUST_API}/places`);
}

/**
 * My visit records. Needs a login; the token is refreshed first if expired.
 *
 * @returns one row per place I saved, [] when none
 */
export async function listMyVisits(): Promise<PlaceVisit[]> {
  const token = await getValidAccessToken();
  return apiGet<PlaceVisit[]>(`${RUST_API}/places/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
