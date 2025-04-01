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

function getAllDirectories(dir: string, baseDir: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const relativePath = path.relative(baseDir, dir);

  const directories = relativePath ? [relativePath] : [];

  return entries.reduce((acc, entry) => {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      return [...acc, ...getAllDirectories(fullPath, baseDir)];
    }
    return acc;
  }, directories);
}

function createFileEntries(languages: string[]): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const files = getAllFiles(contentsRoot);

  languages.forEach((lan) => {
    files.forEach((filePath) => {
      const relativePath = path
        .relative(contentsRoot, filePath)
        .replace(/\\/g, "/");
      const urlPath = relativePath.replace(/\.(mdx|json)$/, "");
      const url = `${baseUrl}/${lan}/${urlPath}`;
      const stats = fs.statSync(filePath);

      entries.push({
        url,
        lastModified: stats.mtime,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  });

  return entries;
}

// 디렉토리 경로에서 URL 항목 생성 (카테고리)
function createCategoryEntries(languages: string[]): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const directories = getAllDirectories(contentsRoot);

  languages.forEach((lan) => {
    directories.forEach((dirPath) => {
      // 디렉토리 경로를 URL 형식으로 변환
      const urlPath = dirPath.replace(/\\/g, "/");
      const url = `${baseUrl}/${lan}/${urlPath}`;

      // 디렉토리의 수정 시간은 가장 최근에 수정된 파일의 시간으로 설정
      const dirFullPath = path.join(contentsRoot, dirPath);
      let lastModified = new Date();

      try {
        const dirStats = fs.statSync(dirFullPath);
        lastModified = dirStats.mtime;
      } catch (error) {
        // 오류 처리 (디렉토리가 존재하지 않는 경우 등)
        console.error(
          `Error getting stats for directory: ${dirFullPath}`,
          error
        );
      }

      entries.push({
        url,
        lastModified: lastModified,
        changeFrequency: "weekly",
        priority: 0.9, // 카테고리 페이지는 약간 더 높은 우선순위 부여
      });
    });
  });

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fileEntries = createFileEntries(languages);
  const categoryEntries = createCategoryEntries(languages);

  const allSitemapEntries: MetadataRoute.Sitemap = [
    ...fileEntries,
    ...categoryEntries,
  ];

  return allSitemapEntries;
}
