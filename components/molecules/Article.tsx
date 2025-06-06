"use client";

import Trends from "@/components/molecules/Trends";

type TrendItem = {
  id: string;
  title: { en: string | null; ko: string | null; ja: string | null };
  type: string;
  url: string;
  score: number;
  by: string;
  time: number;
  content: string | null;
  summary: { en: string | null; ko: string | null; ja: string | null };
};

export default function Article({
  trendsPage,
  content,
}: {
  trendsPage: boolean;
  content: any;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="markdown-body w-full md:w-3/5">
        <div className="my-56" />
        {trendsPage ? (
          <Trends items={content as TrendItem[]} />
        ) : (
          <>{content}</>
        )}
        <div className="my-56" />
      </div>
    </div>
  );
}
