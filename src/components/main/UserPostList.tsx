"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetTitle, setCurrentTitle } from "@/features/blog/blogTitleSlice";

import Pagination from "@/components/ui/Pagination";
import { usePathname } from "next/navigation";
import { clearSelectedCategory } from "@/features/category/categorySelectedSlice";

interface Category {
  _id: string;
  classification: string;
  name_ko: string;
  name_ja: string;
}

interface Post {
  _id: string;
  index: number;
  category: string;
  title_ko: string;
  title_ja: string;
  content_ko: string;
  content_ja: string;
  images: string[];
  image: string;
  like: string[];
  likeCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

const UserPostList: React.FC = () => {
  // Utilities
  const pathname = usePathname();

  // Redux
  const dispatch = useAppDispatch();
  const lan = useAppSelector((state) => state.language);
  const { categories } = useAppSelector((state) => state.category);
  const selectedCategory = useAppSelector(
    (state) => state.categorySelected.selectedCategory
  );

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(12);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const titleRef = useRef<HTMLHeadingElement>(null);

  // Other Hooks
  // posts가 로드된 후 스크롤 최상단으로 이동
  useEffect(() => {
    if (titleRef.current) {
      const offsetPosition =
        titleRef.current.getBoundingClientRect().top + window.scrollY - 80; // Adjust 65px for the fixed navbar height
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, [posts]);

  // 카테고리명 업데이트
  useEffect(() => {
    const currentCategory = categories.find(
      (category: Category) => category._id === selectedCategory?._id
    )?.[`name_${lan.value}`];

    if (currentCategory) {
      dispatch(setCurrentTitle(currentCategory)); // 카테고리가 선택되면 타이틀을 업데이트
    }

    return () => {
      dispatch(resetTitle()); // 컴포넌트가 언마운트될 때 초기 타이틀로 리셋
    };
  }, [categories, dispatch, lan.value, selectedCategory?._id]);

  // 포스트 정보를 페이지네이션을 통해 가져옴
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/paging/${selectedCategory?._id}/${currentPage}?itemsPerPage=${postsPerPage}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPosts(data.posts);
        setTotalPosts(data.pagination.totalItems);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory?._id) {
      fetchPosts();
    }
  }, [currentPage, postsPerPage, selectedCategory?._id]);

  // 페이지 번호를 변경하는 함수
  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  useEffect(() => {
    const url = `${pathname}`; // 링크 이동을 pathname으로 감지
    clearSelectedCategory();
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-transparent">
          <Image
            src="/images/gear.gif"
            width={250}
            height={250}
            alt="loading"
            priority={true}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-56"></div>

      <div className="mt-10">
        <h1
          ref={titleRef}
          className="text-5xl font-semibold my-10 text-neutral-800 dark:text-neutral-200 text-center"
        >
          {lan.value === "ja"
            ? selectedCategory?.name_ja
            : selectedCategory?.name_ko}{" "}
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 md:px-10">
          {posts.map((post, index) => (
            <Link
              key={post._id}
              href={`/post/${
                lan.value === "ja" ? "ja" : lan.value === "ko" ? "ko" : ""
              }/${post.index}`}
              scroll={false}
            >
              <div className="relative bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
                {/* 이미지 */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${post.image || "기본 이미지 경로"})`,
                  }}
                ></div>
                {/* 날짜 및 제목 */}
                <div className="absolute h-1/4 w-full bottom-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 bg-opacity-50 dark:bg-opacity-50">
                  <div className="text-center w-full">
                    <p className="text-sm dark:text-neutral-300">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <h3 className="font-semibold dark:text-neutral-100 truncate mx-5">
                      {lan.value === "ja" ? post.title_ja : post.title_ko}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={totalPosts}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default UserPostList;
