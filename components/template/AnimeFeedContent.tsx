"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
        className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-5 text-white drop-shadow"
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
      <div className="absolute bottom-6 left-4 right-20 z-10 text-white drop-shadow">
        <p className="font-semibold">@{clip.series_slug}</p>
        <p className="mt-1 text-sm text-white/85">
          {clip.episode} · {Math.floor(clip.start_sec / 60)}분{" "}
          {Math.floor(clip.start_sec % 60)}초부터
        </p>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/20">
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
          className="fixed left-1/2 top-6 z-10 -translate-x-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur"
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
    </div>
  );
}
