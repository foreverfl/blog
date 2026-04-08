"use client";

import { resolveHackernewsThumbnail } from "@/lib/hackernews/resolveImage";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Spinner from "../atom/Spinner";
import LinkWithSpinning from "../molecules/LinkWithSpinning";
import Pagination from "../molecules/Pagination";

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

  const allDates = useMemo(() => {
    const arr = jsonContents.flatMap((content) =>
      content.dates.map((date) => ({
        folder: content.folder,
        date,
      })),
    );
    arr.sort((a, b) => (a.date < b.date ? 1 : -1));
    return arr;
  }, [jsonContents]);

  allDates.sort((a, b) => (a.date < b.date ? 1 : -1)); // 최신 날짜가 먼저 오도록 정렬

  const totalPages = Math.ceil(allDates.length / postsPerPage);

  let localizedTitle = "Hacker News Digest";

  if (lan === "en") {
    localizedTitle = "Hacker News Digest";
  } else if (lan === "ja") {
    localizedTitle = "ハッカーニュースダイジェスト";
  } else if (lan === "ko") {
    localizedTitle = "해커뉴스 요약";
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    const processItems = async () => {
      setIsLoading(true);

      // Slice the full date list down to the current page window.
      const startIdx = (currentPage - 1) * postsPerPage;
      const endIdx = currentPage * postsPerPage;
      const pageDates = allDates.slice(startIdx, endIdx);

      // Resolve thumbnails asynchronously and build PostItems.
      const timestamp = Date.now();
      const promises = pageDates.map(async ({ folder, date }) => {
        const formatted = date.replace(/-/g, "");
        const imageUrl = await resolveHackernewsThumbnail(
          R2_BASE ?? "",
          formatted,
          timestamp,
        );
        return {
          key: `${folder}-${date}`,
          href: `/${lan}/trends/${folder}/${date}`,
          date,
          imageUrl,
        };
      });

      const resolvedItems = await Promise.all(promises);

      // 최신순 정렬
      resolvedItems.sort((a, b) => (a.date < b.date ? 1 : -1));
      setItems(resolvedItems);
      setIsLoading(false);
    };

    processItems();
  }, [currentPage, jsonContents, lan, R2_BASE, allDates]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="my-56"></div>

      <div className="grid grid-cols-2 portrait:grid-cols-2 portrait:lg:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10 pb-20 md:pb-0">
        {items.map(({ key, href, date, imageUrl }) => (
          <LinkWithSpinning key={key} href={href}>
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
          </LinkWithSpinning>
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
