"use client";

export const API_AUTH_URL =
  import.meta.env.PUBLIC_API_AUTH_URL || "http://localhost:8001/auth";

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expires_at");
}

// Shared so overlapping callers don't each fire their own /auth/refresh.
let refreshInFlight: Promise<boolean> | null = null;

export function tryRefreshToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_AUTH_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem(
          "token_expires_at",
          String(Date.now() + data.expires_in * 1000),
        );
        return true;
      }
    } catch (e) {
      console.error("Token refresh failed:", e);
    }
    return false;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

/**
 * Returns a non-expired access token for the `Authorization` header, refreshing
 * via /auth/refresh when the stored token has expired. Returns null when the
 * user is not logged in or the refresh fails (caller should treat as anonymous).
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  const expiresAt = localStorage.getItem("token_expires_at");
  if (expiresAt && Date.now() > Number(expiresAt)) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      clearAuth();
      return null;
    }
  }

  return localStorage.getItem("access_token");
}
