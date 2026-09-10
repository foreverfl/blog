// Local dev only: the rust api trusts DEV_USER_ID, so the browser needs no login.
export const DEV_USER = Boolean(import.meta.env.PUBLIC_DEV_USER);

/**
 * Point a localhost api base at the host the page was opened on, so a phone
 * on the LAN reaches the Mac's apis. Only when PUBLIC_DEV_USER is set.
 *
 * @param url - e.g. "http://localhost:8002"
 * @returns the same url, or with localhost swapped for the page host
 */
function withPageHost(url: string): string {
  if (!DEV_USER || typeof window === "undefined") return url;
  return url.replace("localhost", window.location.hostname);
}

// The one place the backend addresses come from; every fetch builds on these.
export const RUST_API = withPageHost(
  import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002",
);

export const API_AUTH_URL = withPageHost(
  import.meta.env.PUBLIC_API_AUTH_URL || "http://localhost:8001/auth",
);
