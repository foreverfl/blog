"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";

import {
  likeClip,
  listClips,
  recordView,
  unlikeClip,
  type ClipResponse,
} from "@/lib/anime/api";
import { useAuth } from "@/lib/context/auth-context";

// Reachable from anywhere via Tailscale (phone included).
const JELLYFIN_URL = "http://mogumogu-ubuntu:8096";

// Fake but stable engagement numbers — seeded by clip id so a clip keeps the
// same counts across renders and reloads.
function seededCounts(id: number) {
  const rand = (n: number) => {
    const x = Math.sin(id * 7919 + n * 104729) * 10000;
    return x - Math.floor(x);
  };
  const likes = Math.floor(800 + rand(1) * 90000);
  return {
    likes,
    comments: Math.floor(likes * (0.01 + rand(2) * 0.04)),
    bookmarks: Math.floor(likes * (0.02 + rand(3) * 0.06)),
    shares: Math.floor(likes * (0.005 + rand(4) * 0.025)),
  };
}

/**
 * Compact count, TikTok style: 843 → "843", 1520 → "1.5K", 2340000 → "2.3M".
 *
 * @param count - raw number
 * @returns display string
 */
function formatCount(count: number): string {
  if (count >= 1_000_000)
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(count);
}

/**
 * Seconds into the episode as mm:ss — 425 → "07:05".
 *
 * @param seconds - offset from the episode start
 * @returns display string
 */
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

// Height of the fixed bottom tab bar, so slide overlays can sit clear of it.
const NAV_HEIGHT = "calc(3.5rem + env(safe-area-inset-bottom))";

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

function NavButton({
  label,
  active,
  badge,
  children,
}: {
  label: string;
  active?: boolean;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex w-[4.5rem] flex-col items-center gap-1 ${active ? "text-white" : "text-white/70"}`}
    >
      <span className="relative">
        {children}
        {badge !== undefined && (
          <span className="absolute -right-2.5 -top-1 rounded-full bg-[#FE2C55] px-1.5 text-[10px] font-bold leading-4 text-white">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

// Looks only — the plus keeps TikTok's cyan/red offset blocks.
function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around bg-black"
      style={{
        height: NAV_HEIGHT,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <NavButton label="ホーム" active>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
      </NavButton>
      <NavButton label="友達">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0 1.8c-2.8 0-5.5 1.4-5.5 3.6V20h11v-3.6c0-2.2-2.7-3.6-5.5-3.6z" />
          <path d="M16 11a3 3 0 1 0-1.6-5.5 4.9 4.9 0 0 1 0 5c.5.3 1 .5 1.6.5zm.6 1.8c-.5 0-1 0-1.4.1 1.2.8 2 2 2 3.4V20h4.3v-3.6c0-1.9-2.3-3.6-4.9-3.6z" />
        </svg>
      </NavButton>
      <button type="button" aria-label="投稿">
        <span className="relative flex h-7 w-11 items-center justify-center">
          <span className="absolute inset-y-0 left-0 w-9 rounded-lg bg-[#25F4EE]" />
          <span className="absolute inset-y-0 right-0 w-9 rounded-lg bg-[#FE2C55]" />
          <span className="absolute inset-x-1 inset-y-0 rounded-lg bg-white" />
          <svg
            className="relative text-black"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
          </svg>
        </span>
      </button>
      <NavButton label="メッセージ" badge={48}>
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        >
          <path d="M20.5 11.4c0 3.9-3.8 7-8.5 7-.9 0-1.8-.1-2.6-.3L4.5 20l1.4-3.2a6.6 6.6 0 0 1-2.4-5.4c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7z" />
        </svg>
      </NavButton>
      <NavButton label="プロフィール">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20.5c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
        </svg>
      </NavButton>
    </nav>
  );
}

function ClipSlide({
  clip,
  soundOn,
  onView,
}: {
  clip: ClipResponse;
  soundOn: boolean;
  onView: (id: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const counts = seededCounts(clip.id);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(clip.liked);
  const [heartBurst, setHeartBurst] = useState(false);
  const [likeTapCount, setLikeTapCount] = useState(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onView(clip.id);
          video.play().catch(() => {
            // sound autoplay blocked: play this one muted
            video.muted = true;
            video.play().catch(() => {});
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [clip.id, onView]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !soundOn;
  }, [soundOn]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  // Optimistic: flip the heart now, roll back if the server call fails.
  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeTapCount((n) => n + 1);
    (next ? likeClip(clip.id) : unlikeClip(clip.id)).catch(() =>
      setLiked(!next),
    );
  };

  // Single tap pauses, double tap likes — the pause waits 250ms to see
  // whether a second tap turns it into a like.
  const handleTap = () => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      if (!liked) toggleLike();
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 600);
    } else {
      tapTimer.current = setTimeout(() => {
        tapTimer.current = null;
        togglePlay();
      }, 250);
    }
  };

  return (
    <section
      className="relative flex h-dvh w-full snap-start items-center justify-center overflow-hidden"
      onClick={handleTap}
    >
      <video
        ref={backdropRef}
        src={clip.url as string}
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl brightness-75"
        playsInline
        muted
        loop
        preload="metadata"
        aria-hidden
      />
      <div className="absolute inset-0 bg-white/10" aria-hidden />
      <video
        ref={videoRef}
        src={clip.url as string}
        className="relative h-full w-full object-contain"
        playsInline
        muted
        loop
        preload="metadata"
        onPlay={() => {
          setPaused(false);
          backdropRef.current?.play().catch(() => {});
        }}
        onPause={() => {
          setPaused(true);
          backdropRef.current?.pause();
        }}
        onTimeUpdate={(e) =>
          setProgress(
            e.currentTarget.currentTime / (e.currentTarget.duration || 1),
          )
        }
      />
      {paused && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="8 5 19 12 8 19 8 5" />
        </svg>
      )}
      {heartBurst && (
        <svg
          className="absolute left-1/2 top-1/2 text-red-500/90"
          style={{ animation: "heart-pop 600ms ease-out forwards" }}
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21s-6.7-4.3-9.3-8C.8 10.2 1.7 6.6 4.6 5.3 6.6 4.4 9 5 12 8c3-3 5.4-3.6 7.4-2.7 2.9 1.3 3.8 4.9 1.9 7.7-2.6 3.7-9.3 8-9.3 8z" />
        </svg>
      )}
      <div
        className="absolute right-3 z-10 flex flex-col items-center gap-5 text-white drop-shadow"
        style={{ bottom: `calc(${NAV_HEIGHT} + 1.25rem)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {clip.jellyfin_item ? (
          <a
            href={`${JELLYFIN_URL}/web/#/details?id=${clip.jellyfin_item}`}
            target="_blank"
            rel="noreferrer"
            aria-label="원작 보기"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/20 text-lg font-bold uppercase"
          >
            {clip.series_slug[0]}
          </a>
        ) : (
          <button
            type="button"
            aria-label="원작 보기"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/20 text-lg font-bold uppercase opacity-60"
          >
            {clip.series_slug[0]}
          </button>
        )}
        <button
          type="button"
          aria-label="좋아요"
          onClick={toggleLike}
          className={`flex flex-col items-center gap-1 ${liked ? "text-red-500" : ""}`}
        >
          <svg
            key={likeTapCount}
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={
              likeTapCount > 0
                ? { animation: "heart-tap 300ms ease-out" }
                : undefined
            }
          >
            <path d="M12 21s-6.7-4.3-9.3-8C.8 10.2 1.7 6.6 4.6 5.3 6.6 4.4 9 5 12 8c3-3 5.4-3.6 7.4-2.7 2.9 1.3 3.8 4.9 1.9 7.7-2.6 3.7-9.3 8-9.3 8z" />
          </svg>
          <span className="text-xs">{formatCount(counts.likes)}</span>
        </button>
        <button
          type="button"
          aria-label="댓글"
          className="flex flex-col items-center gap-1"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.3 8.9 8.9 0 0 1-3.8-.8L3 20l1.1-4.1a8.1 8.1 0 0 1-1.1-4.4A8.38 8.38 0 0 1 11.5 3.2 8.38 8.38 0 0 1 21 11.5z" />
          </svg>
          <span className="text-xs">{formatCount(counts.comments)}</span>
        </button>
        <button
          type="button"
          aria-label="북마크"
          className="flex flex-col items-center gap-1"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
          <span className="text-xs">{formatCount(counts.bookmarks)}</span>
        </button>
        <button
          type="button"
          aria-label="공유"
          className="flex flex-col items-center gap-1"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs">{formatCount(counts.shares)}</span>
        </button>
      </div>
      <div
        className="absolute left-4 right-20 z-10 text-white drop-shadow"
        style={{ bottom: `calc(${NAV_HEIGHT} + 0.75rem)` }}
      >
        <p className="font-semibold">@{clip.series_slug}</p>
        <p className="mt-1 text-sm text-white/85">
          {clip.episode} · from {formatTimestamp(clip.start_sec)}
        </p>
      </div>
      <div
        className="absolute left-0 z-10 h-0.5 w-full bg-white/20"
        style={{ bottom: NAV_HEIGHT }}
      >
        <div
          className="h-full bg-white/80"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </section>
  );
}

function LoadMoreSentinel({ onHit }: { onHit: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onHit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHit]);

  return <div ref={ref} className="h-px" />;
}

export default function AnimeFeedContent() {
  const { isReady, isAdmin } = useAuth();
  const [soundOn, setSoundOn] = useState(false);
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
    enabled: isReady && isAdmin,
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

  if (!isReady) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Page not found</p>
      </div>
    );
  }

  const feed = [...(clips ?? []), ...extraClips].filter((clip) => clip.url);
  feedIds.current = new Set(feed.map((clip) => clip.id));

  return (
    <div className="relative h-dvh w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {isLoading ? null : feed.length ? (
        <>
          {feed.map((clip, index) => (
            <ClipSlide
              key={index} // append-only list; the full-list fallback can repeat clip ids
              clip={clip}
              soundOn={soundOn}
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
      <BottomNav />
    </div>
  );
}
