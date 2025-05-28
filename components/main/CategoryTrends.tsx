"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Pagination from "../molecules/Pagination";
import Spinner from "../atom/Spinner";

interface JsonContentsStructure {
  folder: string;
  dates: string[];
}

interface Props {
  jsonContents: JsonContentsStructure[];
}
interface PostItem {
  key: string;
  href: string;
  date: string;
  imageUrl: string;
}

const CategoryTrends: React.FC<Props> = ({ jsonContents }) => {
  const pathname = usePathname();
  const lan = pathname.split("/")[1];
  const R2_BASE = process.env.NEXT_PUBLIC_R2_URI;

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<PostItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 8;
  const totalPages = Math.ceil(items.length / postsPerPage);

  let localizedTitle = "Hacker News Digest";

  if (lan === "ja") {
    localizedTitle = "ハッカーニュースダイジェスト";
  } else if (lan === "ko") {
    localizedTitle = "해커뉴스 요약";
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentPosts = items.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  useEffect(() => {
    const checkImageExists = async (url: string) => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
      } catch {
        return false;
      }
    };

    const processItems = async () => {
      setIsLoading(true);

      const promises = jsonContents.flatMap((content) =>
        content.dates.map(async (date) => {
          const formatted = date.replace(/-/g, "");
          const url = `${R2_BASE}/hackernews-images/${formatted}.webp`;
          const exists = await checkImageExists(url);
          return {
            key: `${content.folder}-${date}`,
            href: `/${lan}/trends/${content.folder}/${date}`,
            date,
            imageUrl: exists ? url : "/images/placeholder.png",
          };
        })
      );

      const resolvedItems = await Promise.all(promises);
      resolvedItems.sort((a, b) => (a.date < b.date ? 1 : -1));
      setItems(resolvedItems);

      setIsLoading(false);
    };

    processItems();
  }, [jsonContents, lan, R2_BASE]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="my-56"></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10 pb-20 md:pb-0">
        {currentPosts.map(({ key, href, date, imageUrl }) => (
          <Link key={key} href={href}>
            <div className="relative bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
              <Image
                src={imageUrl}
                alt={`HackerNews thumbnail for ${date}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                className="object-cover"
              />
              <div className="absolute h-1/4 w-full bottom-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 bg-opacity-50 dark:bg-opacity-50">
                <div className="text-center w-full">
                  <p className="text-sm dark:text-neutral-300">{date}</p>
                  <h3 className="font-semibold dark:text-neutral-100 truncate mx-5">
                    {localizedTitle}
                  </h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <div className="my-56"></div>
    </>
  );
};

export default CategoryTrends;
