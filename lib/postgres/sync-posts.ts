import sitemap from "@/app/sitemap";
import { upsertPost } from "@/lib/postgres/posts";

function parsePostUrl(url: string) {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;
    const [, classification, category, slug] = parts;
    if (!classification || !category || !slug) return null;
    return { classification, category, slug };
  } catch {
    return null;
  }
}

export async function syncAllPosts() {
  const sitemapEntries = await sitemap();
  let count = 0;
  for (const entry of sitemapEntries) {
    const info = parsePostUrl(entry.url);
    if (info) {
      await upsertPost(info);
      count++;
    }
  }
  console.log(`[sync-posts] Synced ${count} posts to DB`);
  return count;
}
