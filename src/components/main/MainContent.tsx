import React, { useEffect, useState } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

interface Post {
  _id: string;
  index: number;
  category: string;
  title_ko: string;
  title_ja: string;
  content_ko: string;
  content_ja: string;
  images: string[];
  image: string | null;
  like: number;
  createdAt: string; // ISO 문자열 형태로 변환
  [key: string]: any;
}

const MainContent: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();
  const lan = useAppSelector((state) => state.language);
  const { posts, loading } = useAppSelector((state) => state.posts);

  // State
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    // 인기 포스트 정렬 (like가 많은 순으로 상위 8개)
    const sortedPopularPosts = [...posts]
      .sort((a, b) => b.like - a.like)
      .slice(0, 8);
    setPopularPosts(sortedPopularPosts);

    // 최근 포스트 정렬 (날짜가 최신인 순으로 상위 8개)
    const sortedRecentPosts = [...posts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);
    setRecentPosts(sortedRecentPosts);
  }, [posts]);

  return (
    <>
      <div className="my-56"></div>

      <div className="mt-10">
        {/* Popular Posts */}
        <div className="mb-10 dark:bg-neutral-900">
          <h2 className="text-5xl font-semibold text-center my-10 text-neutral-800 dark:text-neutral-200">
            Popular Posts
          </h2>
          <div className="grid grid-cols-4 gap-6 px-5 md:px-10">
            {popularPosts.map((post, index) => (
              <Link
                key={post._id}
                href={`/post/${lan.value === "ja" ? "ja" : "ko"}/${post.index}`}
                scroll={false}
              >
                <div className="bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
                  {/* 이미지 */}
                  <div
                    className="h-3/4 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${post.image || "default path"})`,
                    }}
                  ></div>
                  {/* 날짜 및 제목 */}
                  <div className="bg-gray-200 dark:bg-neutral-700 p-4">
                    <p className="text-sm dark:text-neutral-300">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <h3 className="font-semibold dark:text-neutral-100">
                      {post[`title_${lan.value}`]}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="my-56"></div>

        {/* Recent Posts */}
        <div className="dark:bg-neutral-900">
          <h2 className="text-5xl font-semibold text-center my-10 text-neutral-800 dark:text-neutral-200">
            Recent Posts
          </h2>
          <div className="grid grid-cols-4 gap-4 px-5 md:px-10">
            {recentPosts.map((post) => (
              <Link
                key={post._id}
                href={`/post/${
                  lan.value === "ja" ? "ja" : lan.value === "ko" ? "ko" : ""
                }/${post.index}`}
                scroll={false}
              >
                <div className="bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
                  {/* 이미지 */}
                  <div
                    className="h-3/4 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${post.image || "default path"})`,
                    }}
                  ></div>
                  {/* 날짜 및 제목 */}
                  <div className="bg-gray-200 dark:bg-neutral-700 p-4">
                    <p className="text-sm dark:text-neutral-300">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <h3 className="font-semibold dark:text-neutral-100">
                      {post[`title_${lan.value}`]}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default MainContent;
