import fs from "fs";
import type { MetadataRoute } from "next";
import path from "path";

const baseUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://mogumogu.dev"
).replace(/\/$/, "");

const languages = ["ko", "ja"];
const contentsRoot = path.join(process.cwd(), "contents");

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllFiles(fullPath);
    }
    if (
      entry.isFile() &&
      (fullPath.endsWith(".mdx") || fullPath.endsWith(".json"))
    ) {
      return [fullPath];
    }
    return [];
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allSitemapEntries: MetadataRoute.Sitemap = [];

  const files = getAllFiles(contentsRoot);

  languages.forEach((lan) => {
    files.forEach((filePath) => {
      const relativePath = path
        .relative(path.join(contentsRoot), filePath)
        .replace(/\\/g, "/");

      const urlPath = relativePath.replace(/\.(mdx|json)$/, "");

      const url = `${baseUrl}/${lan}/${urlPath}`;

      const stats = fs.statSync(filePath);

      allSitemapEntries.push({
        url,
        lastModified: stats.mtime,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  });

  return allSitemapEntries;
}
