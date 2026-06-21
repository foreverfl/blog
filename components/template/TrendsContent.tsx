"use client";

import Article from "@/components/molecules/Article";
import Comment from "@/components/molecules/Comment";
import Good from "@/components/molecules/Good";
import { getContents } from "@/lib/content/jsonHelpers";
import { useClientPathname } from "@/lib/hooks/useClientPathname";
import React, { useEffect, useState } from "react";

// Trends (hackernews) detail: the per-date digest lives in R2 JSON, not the DB,
// so it is fetched at runtime here (mirrors SlugContent for DB-backed posts).
const TrendsContent: React.FC = () => {
  const pathname = useClientPathname();
  const segments = pathname.split("/").filter(Boolean);
  const category = segments[2]; // "hackernews"
  const slug = segments[3]; // date, e.g. "2024-10-14"

  const [content, setContent] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!category || !slug) return;

    getContents(category, slug)
      .then((data) => setContent(data as unknown[]))
      .catch((err) => {
        console.error("Failed to fetch trends content:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [category, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full md:w-3/5">
          <div className="my-56" />
        </div>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <>
      <Article trendsPage={true} content={content} />
      <Good />
      <Comment />
    </>
  );
};

export default TrendsContent;
