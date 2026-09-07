"use client";

// Login leaves our origin entirely, so the way back has to survive the round
// trip. sessionStorage is the only place in the tab that does.
const RETURN_PATH_KEY = "login_return_path";

/**
 * Remember where to come back to once login finishes.
 *
 * @param path - path and query of the page login started from
 */
export function rememberReturnPath(path: string): void {
  try {
    sessionStorage.setItem(RETURN_PATH_KEY, path);
  } catch {
    // private mode or blocked storage: the caller falls back to the home page
  }
}

/**
 * Read the remembered path and clear it.
 *
 * @returns a same-site path, or "/" when nothing was stored or the stored value
 *   could send the browser off-site
 */
export function takeReturnPath(): string {
  try {
    const stored = sessionStorage.getItem(RETURN_PATH_KEY);
    sessionStorage.removeItem(RETURN_PATH_KEY);
    // one leading slash is ours; "//evil.com" and "/\evil.com" are not
    if (stored && /^\/(?![/\\])/.test(stored)) return stored;
  } catch {
    // unreadable storage is the same as nothing stored
  }
  return "/";
}
