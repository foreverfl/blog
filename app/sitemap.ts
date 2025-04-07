import { promises as fs } from "fs";
import type { MetadataRoute } from "next";
import path from "path";

const baseUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://mogumogu.dev"
).replace(/\/$/, "");

const languages = ["ko", "ja"];

type CategoryGroup = {
  link: string;
  categories: {
    link: string;
  }[];
};

async function createCategoryEntries(
  languages: string[]
): Promise<MetadataRoute.Sitemap> {
  const filePath = path.join(process.cwd(), "public/category.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  const groups: CategoryGroup[] = JSON.parse(jsonData);
  const lastMod = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    for (const group of groups) {
      for (const category of group.categories) {
        entries.push({
          url: `${baseUrl}/${lang}/${group.link}/${category.link}`,
          lastModified: lastMod,
        });
      }
    }
  }

  return entries;
}

async function createPostEntries(
  languages: string[]
): Promise<MetadataRoute.Sitemap> {
  const contentDir = path.join(process.cwd(), "contents");
  const entries: MetadataRoute.Sitemap = [];
  const lastMod = new Date().toISOString();

  const classifications = await fs.readdir(contentDir);

  for (const classification of classifications) {
    const classificationPath = path.join(contentDir, classification);
    const categories = await fs.readdir(classificationPath);

    for (const category of categories) {
      const categoryPath = path.join(classificationPath, category);
      const files = await fs.readdir(categoryPath);

      for (const file of files) {
        if (!file.endsWith(".mdx")) continue;

        const slug = file.replace(/\.mdx$/, ""); // ex: "001-title-ko"
        const langMatch = slug.match(/-(ko|ja)$/); // 언어 접미어 매치

        if (!langMatch) continue; // -ko, -ja가 없으면 건너뜀
        const lang = langMatch[1]; // "ko" or "ja"
        const cleanSlug = slug.replace(/-(ko|ja)$/, ""); // URL에서 -ko 제거

        if (!languages.includes(lang)) continue;

        entries.push({
          url: `${baseUrl}/${lang}/${classification}/${category}/${cleanSlug}`,
          lastModified: lastMod,
        });
      }
    }
  }
  return entries;
}

async function createHackernewsEntries(
  languages: string[]
): Promise<MetadataRoute.Sitemap> {
  const url = "https://blog_workers.forever-fl.workers.dev/hackernews";
  const lastMod = new Date().toISOString();

  try {
    const res = await fetch(url);
    const data = await res.json();
    const dates: string[] = data.dates;

    const entries: MetadataRoute.Sitemap = [];

    for (const lang of languages) {
      for (const date of dates) {
        entries.push({
          url: `${baseUrl}/${lang}/trends/hackernews/${date}`,
          lastModified: lastMod,
        });
      }
    }

    return entries;
  } catch (error) {
    console.error("❌ Hackernews fetch 실패:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryEntries = await createCategoryEntries(languages);
  const postEntries = await createPostEntries(languages);
  const hackernewsEntries = await createHackernewsEntries(languages);

  const allSitemapEntries: MetadataRoute.Sitemap = [
    ...categoryEntries,
    ...postEntries,
    ...hackernewsEntries,
  ];

  return allSitemapEntries;
}
