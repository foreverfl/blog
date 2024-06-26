import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getPostsForMain } from "@/lib/mongodb";

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
  like: string[];
  likeCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  [key: string]: any;
}

const MainContent: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();
  const lan = useAppSelector((state) => state.language);

  // State
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Other Hooks
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      try {
        const { popularPosts, recentPosts } = await getPostsForMain();
        setPopularPosts(popularPosts);
        setRecentPosts(recentPosts);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
            className="w-8 w-8 object-fit"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-56"></div>

      <div className="mt-10">
        {/* Popular Posts */}
        <div className="mb-10 dark:bg-neutral-900">
          {popularPosts.length > 0 && (
            <h2 className="text-5xl font-semibold text-center my-10 text-neutral-800 dark:text-neutral-200">
              Popular Posts
            </h2>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10">
            {popularPosts.map((post, index) => (
              <Link
                key={post._id}
                href={`/post/${lan.value === "ja" ? "ja" : "ko"}/${post.index}`}
                scroll={false}
              >
                <div className="relative bg-white dark:bg-neutral-800 shadow rounded overflow-hidden aspect-square">
                  {/* 이미지 */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${
                        post.image || "기본 이미지 경로"
                      })`,
                    }}
                  ></div>
                  {/* 날짜 및 제목 */}
                  <div className="absolute h-1/4 w-full bottom-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 bg-opacity-50 dark:bg-opacity-50">
                    <div className="text-center w-full">
                      <p className="text-sm dark:text-neutral-300">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <h3 className="font-semibold dark:text-neutral-100 truncate mx-5">
                        {post[`title_${lan.value}`]}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="my-56"></div>

        {/* Recent Posts */}
        <div className="dark:bg-neutral-900">
          {recentPosts.length > 0 && (
            <h2 className="text-5xl font-semibold text-center my-10 text-neutral-800 dark:text-neutral-200">
              Recent Posts
            </h2>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-5 md:px-10">
            {recentPosts.map((post) => (
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
                      backgroundImage: `url(${
                        post.image || "기본 이미지 경로"
                      })`,
                    }}
                  ></div>
                  {/* 날짜 및 제목 */}
                  <div className="absolute h-1/4 w-full bottom-0 flex items-center justify-center bg-gray-200 dark:bg-neutral-700 bg-opacity-50 dark:bg-opacity-50">
                    <div className="text-center w-full">
                      <p className="text-sm dark:text-neutral-300">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <h3 className="font-semibold dark:text-neutral-100 truncate mx-5">
                        {post[`title_${lan.value}`]}
                      </h3>
                    </div>
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
