"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import LinkWithSpinning from "../molecules/LinkWithSpinning";
import Pagination from "../molecules/Pagination";

interface FrontMatter {
  fileName?: string;
  title: string;
  date: string;
  classification: string;
  category: string;
  image: string;
}

interface Props {
  posts: FrontMatter[];
}

interface Category {
  name_en: string;
  name_ja: string;
  name_ko: string;
  link: string;
}

interface Classification {
  name_en: string;
  name_ja: string;
  name_ko: string;
  link: string;
  categories: Category[];
}

const Category: React.FC<Props> = ({ posts }) => {
  // Utilities
  const pathname = usePathname();
  const lan = pathname.split("/")[1];
  const classificationLink = pathname.split("/")[2];
  const categoryLink = pathname.split("/")[3];

  const [categoryName, setCategoryName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  // Calculate total pages
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Get current posts
  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    // JSON 파일에서 데이터를 가져와서 해당 카테고리만 필터링
    const fetchData = async () => {
      try {
        const response = await fetch("/category.json");
        const data: Classification[] = await response.json();

        // classification과 category가 일치하는 항목을 찾음
        const foundClassification = data.find(
          (classification) => classification.link === classificationLink,
        );

        if (foundClassification) {
          const foundCategory = foundClassification.categories.find(
            (category) => category.link === categoryLink,
          );

          if (foundCategory) {
            setCategoryName(
              (() => {
                switch (lan) {
                  case "en":
                    return foundCategory.name_en;
                  case "ja":
                    return foundCategory.name_ja;
                  case "ko":
                    return foundCategory.name_ko;
                  default:
                    return foundCategory.name_ko;
                }
              })(),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [lan, classificationLink, categoryLink]);

  return (
    <>
      <div className="my-56"></div>

      {/* Category Area */}
      <div>
        {posts.length > 0 && (
          <h2 className="text-5xl font-semibold text-center my-10 text-neutral-800 dark:text-neutral-200">
            {categoryName}
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10">
          {currentPosts.map((post) => (
            <LinkWithSpinning
              key={post.fileName}
              href={`/${lan}/${post.classification}/${
                post.category
              }/${post.fileName?.replace(".mdx", "")}`}
            >
              <div className="relative bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${post.image || "기본 이미지 경로"})`,
                  }}
                ></div>
                <div className="absolute h-1/4 w-full bottom-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 bg-opacity-50 dark:bg-opacity-50">
                  <div className="text-center w-full">
                    <p className="text-sm dark:text-neutral-300">{post.date}</p>
                    <h3 className="font-semibold dark:text-neutral-100 truncate mx-5">
                      {post.title}
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
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default Category;
