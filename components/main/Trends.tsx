"use client";

import { Copy } from "@geist-ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type TrendItem = {
  id: string;
  title: {
    en: string | null;
    ko: string | null;
    ja: string | null;
  };
  type: string;
  url: string;
  score: number;
  by: string;
  time: number;
  content: string | null;
  summary: {
    en: string | null;
    ko: string | null;
    ja: string | null;
  };
};

export default function Trends({ items }: { items: TrendItem[] }) {
  const pathname = usePathname();
  const lan = pathname.split("/")[1] as "en" | "ko" | "ja";
  const [sortBy, setSortBy] = useState<"default" | "score">("default");
  const [copiedList, setCopiedList] = useState<string[]>([]);

  const labels = {
    en: {
      author: "Author",
      score: "Score",
      noData: "No data available.",
      noSummary: "No summary available.",
      sortDefault: "Default Order",
      sortScore: "Sort by Score",
    },
    ko: {
      author: "작성자",
      score: "점수",
      noData: "데이터가 없습니다.",
      noSummary: "요약이 없습니다.",
      sortDefault: "기본순",
      sortScore: "점수순",
    },
    ja: {
      author: "投稿者",
      score: "スコア",
      noData: "データがありません。",
      noSummary: "要約がありません。",
      sortDefault: "デフォルト順",
      sortScore: "スコア順",
    },
  };

  const localeLabel = labels[lan] || labels.en;

  const sortedItems =
    sortBy === "score" ? [...items].sort((a, b) => b.score - a.score) : items;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      const id = uuidv4(); // ✅ string 타입
      setCopiedList((prev) => [...prev, id]);
      setTimeout(() => {
        setCopiedList((prev) => prev.filter((item) => item !== id));
      }, 1500);
    });
  };

  if (!items || items.length === 0) {
    return <div>{localeLabel.noData}</div>;
  }

  return (
    <>
      <div className="flex gap-2 mb-6 justify-end">
        <button
          onClick={() => setSortBy("default")}
          className={`px-3 py-1 rounded ${
            sortBy === "default"
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {localeLabel.sortDefault}
        </button>
        <button
          onClick={() => setSortBy("score")}
          className={`px-3 py-1 rounded ${
            sortBy === "score"
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {localeLabel.sortScore}
        </button>
      </div>

      <article className="space-y-10">
        {sortedItems.map((item, index) => (
          <section key={index} className="pb-6">
            <h2 className="text-xl font-bold leading-relaxed grid grid-cols-[auto_1fr] items-start gap-2">
              <span>{index + 1}.</span>
              <div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.title[lan as "en" | "ja" | "ko"] || item.title.en}
                </a>
                <div className="text-sm text-neutral-400 mt-2">
                  ({item.title.en})
                </div>
              </div>
            </h2>

            <div className="mt-2 text-neutral-700 dark:text-neutral-400">
              {item.summary[lan as "en" | "ja" | "ko"] || localeLabel.noSummary}
            </div>

            <div className="mt-5 text-sm text-neutral-400 flex justify-between items-center">
              <button
                onClick={() =>
                  handleCopy(item.summary[lan] || localeLabel.noSummary)
                }
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Copy size={16} />
              </button>

              <div className="text-right">
                {localeLabel.author}: {item.by} | {localeLabel.score}:{" "}
                {item.score}
              </div>
            </div>
          </section>
        ))}
      </article>

      <AnimatePresence>
        {copiedList.map((id, idx) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: -idx * 60 }} // Y축 offset 위로 쌓이게
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 w-[320px] min-h-[48px] bg-blue-600 text-white px-6 py-3 text-sm rounded shadow-md z-50 flex items-center"
          >
            Copied to clipboard!
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
