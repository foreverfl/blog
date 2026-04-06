"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AllCategory from "@/components/organism/AllCategory";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

interface PostItem {
  fileName?: string;
  title: string;
  date: string;
  classification: string;
  category: string;
  image: string;
}

const HomeContent: React.FC = () => {
  const pathname = usePathname();
  const lan = pathname.split("/")[1] || "en";

  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);
  const [hackernewsPosts, setHackernewsPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    const mapPosts = (
      posts: {
        slug: string;
        title?: string;
        created_at: string;
        classification: string;
        category: string;
        image?: string;
      }[],
    ): PostItem[] =>
      posts.map((p) => ({
        fileName: p.slug,
        title: p.title || "Untitled",
        date:
          p.classification === "trends" ? p.slug : p.created_at.split("T")[0],
        classification: p.classification,
        category: p.category,
        image: p.image || "",
      }));

    Promise.all([
      fetch(`${RUST_API}/posts/recent?lang=${lan}&per_page=8`),
      fetch(`${RUST_API}/posts/trends/hackernews?lang=${lan}&per_page=8`),
    ])
      .then(async ([recentRes, hnRes]) => {
        if (recentRes.ok) {
          const data = await recentRes.json();
          setRecentPosts(mapPosts(data.posts));
        }
        if (hnRes.ok) {
          const data = await hnRes.json();
          setHackernewsPosts(mapPosts(data.posts));
        }
      })
      .catch((err) => console.error("Failed to fetch posts:", err));
  }, [lan]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        <div className="my-56"></div>
        <AllCategory posts={recentPosts} title="Recent Posts" />
        <div className="my-56"></div>
        <AllCategory posts={hackernewsPosts} title="Recent Hackernews" />
        <div className="my-56"></div>
      </div>
    </div>
  );
};

export default HomeContent;
