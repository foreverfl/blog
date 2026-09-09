"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listClips, recordView, type ClipResponse } from "@/lib/anime/api";
import ClipSlide from "@/components/organism/anime/ClipSlide";
import LoadMoreSentinel from "@/components/molecules/LoadMoreSentinel";

const TOP_TABS = ["フォロー中", "ショップ", "おすすめ"];
const ACTIVE_TAB = "おすすめ";

// Looks only — none of these tabs go anywhere.
function TopTabs() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-20 text-white drop-shadow"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="relative flex items-center justify-center gap-3.5 px-4 py-3 text-[17px]">
        <button
          type="button"
          aria-label="LIVE"
          className="absolute left-4 top-1/2 -translate-y-1/2"
        >
          <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
            <path
              d="M10.5 5 13.5 1.5M19.5 5 16.5 1.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <rect
              x="2.1"
              y="5.1"
              width="25.8"
              height="18.8"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <text
              x="15"
              y="17.8"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              letterSpacing="0.2"
              fill="currentColor"
            >
              LIVE
            </text>
          </svg>
        </button>
        {TOP_TABS.map((label) => (
          <span
            key={label}
            className={
              label === ACTIVE_TAB ? "relative font-semibold" : "text-white/60"
            }
          >
            {label}
            {label === ACTIVE_TAB && (
              <span className="absolute -bottom-1.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-white" />
            )}
          </span>
        ))}
        <button
          type="button"
          aria-label="검색"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AnimeFeedContent({ visible }: { visible: boolean }) {
  const [soundOn, setSoundOn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [extraClips, setExtraClips] = useState<ClipResponse[]>([]);
  const viewedIds = useRef(new Set<number>());
  const feedIds = useRef(new Set<number>());
  const loadingMore = useRef(false);

  // Once per clip per page load — re-entering a slide doesn't recount.
  const markViewed = useCallback((id: number) => {
    if (viewedIds.current.has(id)) return;
    viewedIds.current.add(id);
    recordView(id).catch(() => {});
  }, []);

  const { data: clips, isLoading } = useQuery({
    queryKey: ["anime", "clips"],
    // Everything can be already-viewed — fall back to the full list.
    queryFn: async () => {
      const unviewed = await listClips(false, 50);
      return unviewed.some((clip) => clip.url)
        ? unviewed
        : listClips(undefined, 50);
    },
    refetchOnWindowFocus: false, // random order: a refetch would reshuffle mid-scroll
  });

  // Reaching the end appends another unviewed batch; when nothing unviewed is
  // left, fall back to the full list so the feed wraps around instead of ending.
  const loadMore = useCallback(async () => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    try {
      let batch = (await listClips(false, 50)).filter(
        (clip) => clip.url && !feedIds.current.has(clip.id),
      );
      if (!batch.length) {
        batch = (await listClips(undefined, 50)).filter((clip) => clip.url);
      }
      if (batch.length) setExtraClips((prev) => [...prev, ...batch]);
    } catch {
      // next sentinel hit retries
    } finally {
      loadingMore.current = false;
    }
  }, []);

  const feed = [...(clips ?? []), ...extraClips].filter((clip) => clip.url);
  feedIds.current = new Set(feed.map((clip) => clip.id));

  return (
    <div className="no-scrollbar relative h-dvh w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {isLoading ? null : feed.length ? (
        <>
          {feed.map((clip, index) => (
            <ClipSlide
              key={index} // append-only list; the full-list fallback can repeat clip ids
              clip={clip}
              index={index}
              active={visible && index === activeIndex}
              near={Math.abs(index - activeIndex) <= 1}
              soundOn={soundOn}
              onActive={setActiveIndex}
              onView={markViewed}
            />
          ))}
          <LoadMoreSentinel onHit={loadMore} />
        </>
      ) : (
        <p className="flex h-dvh items-center justify-center text-white">
          No clips
        </p>
      )}
      {!soundOn && !isLoading && feed.length > 0 && (
        <button
          type="button"
          aria-label="소리 켜기"
          onClick={(e) => {
            e.stopPropagation();
            setSoundOn(true);
          }}
          className="fixed left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur"
          style={{ top: "calc(env(safe-area-inset-top) + 3.5rem)" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon
              points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
              fill="currentColor"
              stroke="none"
            />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </button>
      )}
      <TopTabs />
    </div>
  );
}
