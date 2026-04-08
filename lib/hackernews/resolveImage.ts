// Hackernews thumbnails were historically generated as webp, but are now generated as png.
// Try png first, fall back to webp, and return a placeholder if neither exists.

const PLACEHOLDER = "/images/placeholder.png";

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Given a webp thumbnail URL, replace it with the png variant if the png exists
 * at the same path. Otherwise return the original webp URL unchanged.
 */
export async function preferPngOverWebp(webpUrl: string): Promise<string> {
  if (!webpUrl) return webpUrl;
  const pngUrl = webpUrl.replace(/\.webp(\?.*)?$/, ".png$1");
  if (pngUrl === webpUrl) return webpUrl;
  if (await headOk(pngUrl)) return pngUrl;
  return webpUrl;
}

/**
 * Resolve a hackernews thumbnail URL from the R2 base path and a date (YYYYMMDD).
 * Fallback order: png → webp → placeholder.
 */
export async function resolveHackernewsThumbnail(
  r2Base: string,
  yyyymmdd: string,
  cacheBust: number | string = Date.now(),
): Promise<string> {
  const pngUrl = `${r2Base}/hackernews-images/${yyyymmdd}.png?t=${cacheBust}`;
  if (await headOk(pngUrl)) return pngUrl;
  const webpUrl = `${r2Base}/hackernews-images/${yyyymmdd}.webp?t=${cacheBust}`;
  if (await headOk(webpUrl)) return webpUrl;
  return PLACEHOLDER;
}
