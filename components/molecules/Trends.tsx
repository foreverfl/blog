"use client";

import TrendItemActions from "@/components/atom/TrendItemActions";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

type TrendItem = {
  id: string;
  hnId: number;
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
  const lan = pathname.split("/")[1] as "en" | "ja" | "ko";
  const [sortBy, setSortBy] = useState<"default" | "score">("default");
  const [copiedList, setCopiedList] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch(`${RUST_API}/hackernews/likes`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { ids: [] }))
      .then((data: { ids: number[] }) => {
        if (!cancelled && Array.isArray(data.ids)) {
          setLikedIds(new Set(data.ids));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleLike = (hnId: number) => {
    const wasLiked = likedIds.has(hnId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(hnId);
      else next.add(hnId);
      return next;
    });

    const revert = () => {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(hnId);
        else next.delete(hnId);
        return next;
      });
    };

    fetch(`${RUST_API}/hackernews/likes/${hnId}`, {
      method: wasLiked ? "DELETE" : "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) revert();
      })
      .catch(revert);
  };

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
    if (typeof navigator.clipboard === "undefined") {
      alert("이 환경에서는 클립보드 복사가 지원되지 않습니다.");
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      const id = uuidv4();
      setCopiedList((prev) => [...prev, id]);
      setTimeout(() => {
        setCopiedList((prev) => prev.filter((item) => item !== id));
      }, 1500);
    });
  };

  const handleExternalLink = (item: TrendItem) => {
    const hnUrl = `https://news.ycombinator.com/item?id=${item.hnId}`;
    window.open(hnUrl, "_blank", "noopener,noreferrer");
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
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  ({item.title.en})
                </div>
              </div>
            </h2>

            <div className="mt-2 text-neutral-700 dark:text-neutral-400">
              <ReactMarkdown>
                {item.summary[lan as "en" | "ja" | "ko"] ||
                  localeLabel.noSummary}
              </ReactMarkdown>
            </div>

            <div className="mt-5 text-sm text-neutral-400 flex justify-between items-center">
              <TrendItemActions
                isLiked={likedIds.has(item.hnId)}
                onToggleLike={() => toggleLike(item.hnId)}
                onCopy={() =>
                  handleCopy(item.summary[lan] ?? localeLabel.noSummary)
                }
                onExternalLink={() => handleExternalLink(item)}
              />

              {/* Author and score information */}
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
            className="fixed bottom-6 right-6 w-[320px] min-h-12 bg-blue-600 text-white px-6 py-3 text-sm rounded shadow-md z-50 flex items-center"
          >
            Copied to clipboard!
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
