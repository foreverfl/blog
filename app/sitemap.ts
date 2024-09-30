import fs from "fs";
import path from "path";
import { getAllPostFrontMatters } from "@/lib/mdxHelpers";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const languages = ["ko", "ja"];
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://mogumogu.dev"
  ).replace(/\/$/, ""); // 끝 슬래시 제거

  let allSitemapEntries: MetadataRoute.Sitemap = [];
  const menuFilePath = path.join(process.cwd(), "public", "category.json");

  for (const lan of languages) {
    // 메뉴 기반
    const menuData = JSON.parse(fs.readFileSync(menuFilePath, "utf8"));
    for (const classification of menuData) {
      for (const category of classification.categories) {
        const sitemapEntry = {
          url: `${baseUrl}/${lan}/${classification.link}/${category.link}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7, // 분류/카테고리 페이지의 우선순위 설정
        };
        allSitemapEntries.push(sitemapEntry);
      }
    }

    // 포스트 기반
    const posts = await getAllPostFrontMatters(lan);
    const sitemapEntries = posts.map((post) => ({
      url: `${baseUrl}/${lan}/${post.classification}/${
        post.category
      }/${post.fileName?.replace(".mdx", "")}`,
      lastModified: new Date(post.date),
      changeFrequency: "weekly" as const,
      priority: 0.8, // 우선순위 설정
    }));

    // Sitemap에 추가
    allSitemapEntries = allSitemapEntries.concat(sitemapEntries);
  }

  return allSitemapEntries;
}
