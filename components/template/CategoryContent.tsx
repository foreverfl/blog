"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LinkWithSpinning from "../molecules/LinkWithSpinning";
import Pagination from "../molecules/Pagination";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

interface PostItem {
  slug: string;
  title?: string;
  created_at: string;
  classification: string;
  category: string;
  image?: string;
}

interface Classification {
  name_en: string;
  name_ja: string;
  name_ko: string;
  link: string;
  categories: {
    name_en: string;
    name_ja: string;
    name_ko: string;
    link: string;
  }[];
}

const POSTS_PER_PAGE = 8;

const CategoryContent: React.FC = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const lan = segments[0] || "en";
  const classification = segments[1];
  const category = segments[2];

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryName, setCategoryName] = useState("");

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  useEffect(() => {
    fetch("/category.json")
      .then((res) => res.json())
      .then((data: Classification[]) => {
        const cls = data.find((c) => c.link === classification);
        const cat = cls?.categories.find((c) => c.link === category);
        if (cat) {
          const name =
            lan === "en"
              ? cat.name_en
              : lan === "ja"
                ? cat.name_ja
                : cat.name_ko;
          setCategoryName(name);
        }
      })
      .catch((err) => console.error("Error fetching category.json:", err));
  }, [lan, classification, category]);

  useEffect(() => {
    if (!classification || !category) return;

    fetch(
      `${RUST_API}/posts/${classification}/${category}?lang=${lan}&page=${currentPage}&per_page=${POSTS_PER_PAGE}`,
    )
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setPosts(data.posts);
        setTotal(data.total);
      })
      .catch((err) => console.error("Failed to fetch posts:", err));
  }, [classification, category, lan, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="my-56"></div>

      <div>
        {posts.length > 0 && (
          <h2 className="text-5xl font-semibold text-center my-10 text-neutral-800 dark:text-neutral-200">
            {categoryName}
          </h2>
        )}
        <div className="grid grid-cols-2 portrait:grid-cols-2 portrait:lg:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10">
          {posts.map((post) => (
            <LinkWithSpinning
              key={post.slug}
              href={`/${lan}/${post.classification}/${post.category}/${post.slug}`}
            >
              <div className="relative bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${post.image || ""})`,
                  }}
                ></div>
                <div className="absolute h-1/4 w-full bottom-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 bg-opacity-50 dark:bg-opacity-50">
                  <div className="text-center w-full">
                    <p className="text-sm dark:text-neutral-300">
                      {post.created_at.split("T")[0]}
                    </p>
                    <h3 className="font-semibold dark:text-neutral-100 truncate mx-5">
                      {post.title || "Untitled"}
                    </h3>
                  </div>
                </div>
              </div>
            </LinkWithSpinning>
          ))}
        </div>

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

export default CategoryContent;
