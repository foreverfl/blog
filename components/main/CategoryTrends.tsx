"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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

  return (
    <>
      <div className="my-56"></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10 pb-20 md:pb-0">
        {jsonContents.map((content) =>
          content.dates.map((date) => {
            const imageUrl = `/images/hackernews/dall-${date.replace(
              /-/g,
              ""
            )}.webp`;

            return (
              <Link
                key={`${content.folder}-${date}`}
                href={`/${lan}/trends/${content.folder}/${date}`}
              >
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
            );
          })
        )}
      </div>
    </>
  );
};

export default CategoryTrends;
