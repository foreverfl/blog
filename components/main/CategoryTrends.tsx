"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface JsonContentsStructure {
  folder: string;
  dates: string[];
}

interface Props {
  jsonContents: JsonContentsStructure[];
}

const CategoryTrends: React.FC<Props> = ({ jsonContents }) => {
  const pathname = usePathname();
  const lan = pathname.split("/")[1];
  console.log("test");
  console.log("lan: ", lan);

  let localizedTitle = "Hacker News Digest";

  if (lan === "ja") {
    localizedTitle = "ハッカーニュースダイジェスト";
  } else if (lan === "ko") {
    localizedTitle = "해커뉴스 요약";
  }

  const allItems = jsonContents
    .flatMap((content) =>
      content.dates.map((date) => ({
        key: `${content.folder}-${date}`,
        href: `/${lan}/trends/${content.folder}/${date}`,
        date,
        imageUrl: `/images/hackernews/dall-${date.replace(/-/g, "")}.webp`,
      }))
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // 날짜 내림차순 정렬

  // 🔸 Pagination
  const postsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allItems.length / postsPerPage);

  const currentPosts = allItems.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="my-56"></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10 pb-20 md:pb-0">
        {currentPosts.map(({ key, href, date, imageUrl }) => (
          <Link key={key} href={href}>
            <div className="relative bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${imageUrl || "기본 이미지 경로"})`,
                }}
              ></div>
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
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <button
            className="mx-2 px-3 py-1 border border-gray-400 rounded disabled:opacity-50 text-gray-800 dark:text-white"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`mx-1 px-3 py-1 border border-gray-400 rounded ${
                currentPage === index + 1
                  ? "bg-gray-400 text-white"
                  : "bg-white text-gray-800 dark:text-gray-800"
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="mx-2 px-3 py-1 border border-gray-400 rounded disabled:opacity-50 text-gray-800 dark:text-gray-800"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div className="my-56"></div>
    </>
  );
};

export default CategoryTrends;
