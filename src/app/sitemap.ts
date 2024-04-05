import { getAllPostsForSitemap } from "@/lib/mongodb";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const links = [
    {
      url: "https://mogumogu.dev/",
      lastModified: new Date(),
    },
  ];

  const postsData = await getAllPostsForSitemap();

  postsData.forEach((postData) => {
    // 한국어 버전의 포스트 URL 추가
    links.push({
      url: `https://mogumogu.dev/post/ko/${postData.index}`,
      lastModified: new Date(postData.updatedAt),
    });

    // 일본어 버전의 포스트 URL 추가
    links.push({
      url: `https://mogumogu.dev/post/ja/${postData.index}`,
      lastModified: new Date(postData.updatedAt),
    });
  });
  return links;
}
