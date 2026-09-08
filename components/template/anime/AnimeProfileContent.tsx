"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { NAV_HEIGHT } from "@/components/organism/anime/BottomNav";
import AnimeLikedFeedContent from "@/components/template/anime/AnimeLikedFeedContent";
import { listClips } from "@/lib/anime/api";

// Nothing here is real — the numbers and the bio are set dressing so the screen
// reads as TikTok's profile.
const DISPLAY_NAME = "もぐもぐ";
const BIO = "30-second cuts of the anime I have watched.";

const STATS = [
  { label: "フォロー中", value: "208" },
  { label: "フォロワー", value: "144" },
  { label: "いいね", value: "5,132" },
];

const TOP_ICONS = [
  // person with a plus
  "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0 1.8c-2.8 0-5.5 1.4-5.5 3.6V20h11v-3.6c0-2.2-2.7-3.6-5.5-3.6zM18 5v3h-3v2h3v3h2v-3h3V8h-3V5z",
  // gift box
  "M20 7h-2.2a3 3 0 0 0-4.3-3.9L12 4.2l-1.5-1.1A3 3 0 0 0 6.2 7H4v4h1v9h14v-9h1zm-6.5-2.4a1 1 0 1 1 1.2 1.6L13 7l.5-2.4zM9.3 4.6 10.9 7 8.8 6.2a1 1 0 0 1 .5-1.6zM7 13h4v5H7zm6 5v-5h4v5z",
];

const TAB_ICONS = [
  // grid
  "M4 4h3v16H4zm6.5 0h3v16h-3zM17 4h3v16h-3z",
  // lock
  "M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9zm-8 0V7a3 3 0 0 1 6 0v2z",
  // repost
  "M7 7h9l-2.3-2.3L15.1 3.3 19.8 8l-4.7 4.7-1.4-1.4L16 9H7a2 2 0 0 0-2 2v2H3v-2a4 4 0 0 1 4-4zm10 10H8l2.3 2.3-1.4 1.4L4.2 16l4.7-4.7 1.4 1.4L8 15h9a2 2 0 0 0 2-2v-2h2v2a4 4 0 0 1-4 4z",
  // bookmark
  "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  // heart
  "M12 21s-6.7-4.3-9.3-8C.8 10.2 1.7 6.6 4.6 5.3 6.6 4.4 9 5 12 8c3-3 5.4-3.6 7.4-2.7 2.9 1.3 3.8 4.9 1.9 7.7-2.6 3.7-9.3 8-9.3 8z",
];

const HEART_TAB = 4;

/**
 * A throwaway handle in TikTok's auto-generated shape, new on every load.
 *
 * @returns nine lowercase letters and digits, e.g. "2zapa24sg"
 */
function randomHandle(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 9 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function Icon({ path, size = 26 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

export default function AnimeProfileContent() {
  const [tab, setTab] = useState(0);
  const [handle] = useState(randomHandle); // once per mount, not per render
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // The list API has no liked filter and hands back the feed's random order.
  const { data: likedClips } = useQuery({
    queryKey: ["anime", "liked"],
    queryFn: () => listClips(undefined, 1000),
    enabled: tab === HEART_TAB,
    select: (rows) =>
      rows
        .filter((clip) => clip.liked && clip.url)
        .sort((a, b) => (b.liked_at ?? "").localeCompare(a.liked_at ?? "")),
    refetchOnWindowFocus: false,
  });

  return (
    <div
      className="no-scrollbar h-dvh w-full overflow-y-auto bg-black text-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: NAV_HEIGHT,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {TOP_ICONS.map((path) => (
            <Icon key={path} path={path} />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="7" cy="9" r="3.2" />
            <circle cx="17" cy="9" r="3.2" />
            <path d="M4 14h6v2H4zm10 0h6v2h-6z" />
          </svg>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M4 19c1-6 5-8 10-8V7l7 6-7 6v-4c-4 0-7 1-10 4z" />
          </svg>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center px-6">
        <div className="relative mt-2">
          <div className="h-24 w-24 rounded-full bg-white/15" />
          <span className="absolute -bottom-1 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#20D5EC] text-black">
            <Icon path="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" size={18} />
          </span>
        </div>

        <p className="mt-6 text-xl font-bold">{DISPLAY_NAME}</p>
        <p className="mt-1 text-sm text-white/50">@{handle}</p>

        <div className="mt-5 flex items-stretch">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center px-6 ${index > 0 ? "border-l border-white/15" : ""}`}
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="mt-0.5 text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-sm">{BIO}</p>
      </div>

      <div className="mt-6 flex border-b border-white/15">
        {TAB_ICONS.map((path, index) => (
          <button
            key={path}
            type="button"
            onClick={() => setTab(index)}
            className={`flex flex-1 justify-center pb-2.5 ${index === tab ? "border-b-2 border-white text-white" : "text-white/40"}`}
          >
            <Icon path={path} />
          </button>
        ))}
      </div>

      {tab === HEART_TAB &&
        (likedClips?.length ? (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {likedClips.map((clip, index) => (
              <button
                key={clip.id}
                type="button"
                onClick={() => setOpenIndex(index)}
                className="aspect-[9/16] overflow-hidden bg-white/5"
              >
                {/* No image thumbnails exist, so the clip's own first frame
                    stands in for one. */}
                <video
                  src={`${clip.url}#t=0.1`}
                  className="h-full w-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-white/40">
            No liked clips yet
          </p>
        ))}

      {openIndex !== null && likedClips && (
        <AnimeLikedFeedContent
          clips={likedClips}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
