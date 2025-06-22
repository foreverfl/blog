export interface SearchItem {
  title: string;
  content: string;
  link: string;
  type: string;
  lang?: string;
}

// in-memory cache for Fuse.js
let fuseCache: SearchItem[] | null = null;
let lastLoaded = 0;

export function setFuseCache(data: SearchItem[]) {
  fuseCache = data;
  lastLoaded = Date.now();
}

export function getFuseCache(lang?: string) {
  if (!fuseCache) return [];
  if (!lang) return fuseCache;
  return fuseCache.filter((item) => !item.lang || item.lang === lang);
}

export function clearFuseCache() {
  fuseCache = null;
  lastLoaded = 0;
}
