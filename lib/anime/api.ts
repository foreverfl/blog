import { getValidAccessToken } from "@/lib/auth/token";
import { apiDelete, apiGet, apiPost } from "@/lib/query/query";

const RUST_API = import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002";

export interface ClipResponse {
  id: number;
  r2_key: string | null;
  series_slug: string;
  series_title: string | null;
  episode: string;
  start_sec: number;
  duration_sec: number;
  jellyfin_item: string | null;
  is_opening: boolean;
  liked: boolean;
  liked_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  url: string | null;
}

// Refresh the token if expired before every request, so a long-idle page
// doesn't send a stale token and get stuck on 401.
async function authHeader() {
  const token = await getValidAccessToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * List feed clips (server returns them in random order).
 *
 * @param viewed - false = only unviewed, true = only viewed, omit = all
 * @param limit - max rows, server caps at 1000
 * @returns clips; url is null when the media was cleaned up
 */
export async function listClips(
  viewed?: boolean,
  limit = 100,
): Promise<ClipResponse[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (viewed !== undefined) params.set("viewed", String(viewed));
  return apiGet<ClipResponse[]>(`${RUST_API}/anime/clips?${params}`, {
    headers: await authHeader(),
  });
}

/**
 * List liked clips, newest like first.
 *
 * @param limit - page size
 * @param offset - rows to skip
 * @returns one page of liked clips
 */
export async function listLikedClips(
  limit: number,
  offset: number,
): Promise<ClipResponse[]> {
  const params = new URLSearchParams({
    liked: "true",
    limit: String(limit),
    offset: String(offset),
  });
  return apiGet<ClipResponse[]>(`${RUST_API}/anime/clips?${params}`, {
    headers: await authHeader(),
  });
}

/**
 * Count one viewing of a clip.
 *
 * @param id - clip id
 * @returns the updated clip (view_count bumped, last_viewed_at set)
 */
export async function recordView(id: number): Promise<ClipResponse> {
  return apiPost<ClipResponse>(
    `${RUST_API}/anime/clips/${id}/view`,
    {},
    { headers: await authHeader() },
  );
}

/**
 * Like a clip (server also moves its R2 object feed/ -> liked/).
 *
 * @param id - clip id
 * @returns the updated clip (liked true, url under liked/)
 */
export async function likeClip(id: number): Promise<ClipResponse> {
  return apiPost<ClipResponse>(
    `${RUST_API}/anime/clips/${id}/like`,
    {},
    { headers: await authHeader() },
  );
}

/**
 * Undo a like (moves the R2 object back to feed/).
 *
 * @param id - clip id
 * @returns the updated clip (liked false, url under feed/)
 */
export async function unlikeClip(id: number): Promise<ClipResponse> {
  return apiDelete<ClipResponse>(`${RUST_API}/anime/clips/${id}/like`, {
    headers: await authHeader(),
  });
}

/**
 * Report one playback problem. Fire-and-forget: keepalive keeps the request
 * alive while the page is being hidden, and sendBeacon is not an option here
 * because it cannot carry the Authorization header.
 *
 * @param id - clip the problem happened on
 * @param event - event name plus whatever the player could read
 */
export async function reportPlaybackEvent(
  id: number,
  event: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch(`${RUST_API}/anime/clips/${id}/playback-event`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(event),
    });
  } catch {
    // the clip is already misbehaving — a failed report must not add to it
  }
}
