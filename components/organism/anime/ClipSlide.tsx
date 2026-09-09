"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react";

import {
  likeClip,
  reportPlaybackEvent,
  unlikeClip,
  type ClipResponse,
} from "@/lib/anime/api";
import { NAV_HEIGHT } from "@/components/organism/anime/BottomNav";
// Reachable from anywhere via Tailscale (phone included).
const JELLYFIN_URL = "http://mogumogu-ubuntu:8096";

// One id per app open, so a night's problems group together in the log.
const SESSION_ID = Math.random().toString(36).slice(2, 10);

// Shorter than this is a normal hiccup, not something worth a log line.
const STALL_REPORT_MS = 3000;

/**
 * Seconds since the clip's signed link was issued — X-Amz-Date rides in the url.
 *
 * @param url - signed R2 link, null once the media is gone
 * @returns age in seconds, or null when the url carries no date
 */
function urlAgeSec(url: string | null): number | null {
  const stamp = url && new URL(url).searchParams.get("X-Amz-Date");
  if (!stamp) return null;
  const issued = Date.parse(
    stamp.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
      "$1-$2-$3T$4:$5:$6Z",
    ),
  );
  return Number.isNaN(issued) ? null : Math.round((Date.now() - issued) / 1000);
}

/**
 * What the player could tell us the moment something went wrong.
 *
 * @param video - the element that stalled or failed
 * @param url - the clip's signed link
 * @returns log fields; buffer_left_sec near zero is the download failing to
 *          keep up, which is the one thing the phone cannot fix
 */
function playerState(video: HTMLVideoElement, url: string | null) {
  const { buffered, currentTime } = video;
  const bufferedEnd = buffered.length
    ? buffered.end(buffered.length - 1)
    : currentTime;
  const { connection } = navigator as Navigator & {
    connection?: { downlink?: number; effectiveType?: string };
  };
  return {
    session_id: SESSION_ID,
    buffer_left_sec: Number((bufferedEnd - currentTime).toFixed(2)),
    downlink: connection?.downlink ?? null,
    effective_type: connection?.effectiveType ?? null,
    error_code: video.error?.code ?? null,
    url_age_sec: urlAgeSec(url),
    muted: video.muted,
    volume: video.volume,
  };
}

// Seeded by clip id, so everything fake about a clip survives a reload.
function seededRandom(id: number, n: number): number {
  const x = Math.sin(id * 7919 + n * 104729) * 10000;
  return x - Math.floor(x);
}

// Fake but stable engagement numbers.
function seededCounts(id: number) {
  const rand = (n: number) => seededRandom(id, n);
  const likes = Math.floor(800 + rand(1) * 90000);
  return {
    likes,
    comments: Math.floor(likes * (0.01 + rand(2) * 0.04)),
    bookmarks: Math.floor(likes * (0.02 + rand(3) * 0.06)),
    shares: Math.floor(likes * (0.005 + rand(4) * 0.025)),
  };
}

/**
 * A TikTok-shaped handle standing in for the uploader, same on every visit.
 *
 * @param id - clip id, the seed
 * @returns nine lowercase letters and digits, e.g. "2zapa24sg"
 */
function seededHandle(id: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 9 },
    (_, index) =>
      chars[Math.floor(seededRandom(id, index + 10) * chars.length)],
  ).join("");
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
// Drag anywhere on the bar to scrub. The padded top is the touch target — a
// 2px line is too thin to grab.
function SeekBar({
  videoRef,
  progress,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  progress: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  const seekTo = (clientX: number) => {
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track) return;
    const { left, width } = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
    setDragRatio(ratio);
    if (video?.duration) video.currentTime = ratio * video.duration;
  };

  const dragging = dragRatio !== null;
  const shown = dragRatio ?? progress;

  // Follow the finger on the window instead of capturing the pointer on the
  // element — iOS drops the capture partway through a touch drag.
  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => seekTo(event.clientX);
    const stop = () => setDragRatio(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  });

  return (
    <div
      className={`absolute inset-x-0 z-10 flex touch-none items-end pt-8 ${dragging ? "cursor-grabbing" : "cursor-pointer"}`}
      style={{ bottom: NAV_HEIGHT }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => seekTo(e.clientX)}
    >
      <div
        ref={trackRef}
        className={`relative w-full rounded-full bg-white/25 ${dragging ? "h-1" : "h-0.5"}`}
      >
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${shown * 100}%` }}
        />
        <span
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${dragging ? "h-3 w-3" : "h-1.5 w-1.5"}`}
          style={{ left: `${shown * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ClipSlide({
  clip,
  index,
  active,
  near,
  soundOn,
  onActive,
  onView,
}: {
  clip: ClipResponse;
  index: number;
  active: boolean;
  near: boolean;
  soundOn: boolean;
  onActive: (index: number) => void;
  onView: (id: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const counts = seededCounts(clip.id);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(clip.liked);
  // Where the double tap landed and how far to tip the heart, so it pops at the
  // finger and never twice at the same angle.
  const [heartBurst, setHeartBurst] = useState<{
    x: number;
    y: number;
    tilt: number;
  } | null>(null);
  const [likeTapCount, setLikeTapCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallStart = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onActive(index);
          onView(clip.id);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [clip.id, index, onActive, onView]);

  // Dropping the attribute alone keeps the decoder — load() is what frees it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const url = clip.url as string;
    if (near) {
      if (video.getAttribute("src") === url) return;
      video.src = url;
      video.load();
    } else if (video.hasAttribute("src")) {
      video.removeAttribute("src");
      video.load();
    }
  }, [near, clip.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    // Undo a mute an earlier clip forced on us, before this one plays.
    video.muted = !soundOn;
    video.play().catch((err: DOMException) => {
      // Only the autoplay policy is fixed by muting — an AbortError is not.
      if (err.name !== "NotAllowedError" || video.muted) return;
      video.muted = true;
      reportPlaybackEvent(clip.id, {
        event: "muted",
        ...playerState(video, clip.url),
      });
      video.play().catch(() => {});
    });
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !soundOn;
  }, [soundOn]);

  useEffect(() => {
    return () => {
      if (stallTimer.current) clearTimeout(stallTimer.current);
    };
  }, []);

  // waiting fires on every small hiccup, so the line waits out STALL_REPORT_MS
  // first; the recovery line then carries how long the stall actually ran.
  const startStall = () => {
    if (stallTimer.current) return;
    stallStart.current = Date.now();
    stallTimer.current = setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      reportPlaybackEvent(clip.id, {
        event: "stall",
        ...playerState(video, clip.url),
      });
    }, STALL_REPORT_MS);
  };

  const endStall = () => {
    if (stallTimer.current) {
      clearTimeout(stallTimer.current);
      stallTimer.current = null;
    }
    const started = stallStart.current;
    stallStart.current = null;
    const video = videoRef.current;
    if (!started || !video || Date.now() - started < STALL_REPORT_MS) return;
    reportPlaybackEvent(clip.id, {
      event: "recovered",
      stall_ms: Date.now() - started,
      ...playerState(video, clip.url),
    });
  };

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

  // The link is a signed one that dies in an hour or two, so handing it out is
  // as far as sharing goes.
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(clip.url as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // blocked on an insecure origin — nothing useful to say in the rail
    }
  };

  // Single tap pauses, double tap likes — the pause waits 250ms to see
  // whether a second tap turns it into a like.
  const handleTap = (event: ReactMouseEvent<HTMLElement>) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    const point = {
      x: event.clientX - left,
      y: event.clientY - top,
      tilt: Math.random() * 50 - 25,
    };
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      if (!liked) toggleLike();
      setHeartBurst(point);
      setTimeout(() => setHeartBurst(null), 600);
    } else {
      tapTimer.current = setTimeout(() => {
        tapTimer.current = null;
        togglePlay();
      }, 250);
    }
  };

  return (
    <section
      className="relative flex h-dvh w-full snap-start snap-always items-center justify-center overflow-hidden"
      onClick={handleTap}
    >
      {active && (
        <video
          ref={backdropRef}
          src={clip.url as string}
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl brightness-75"
          playsInline
          autoPlay
          muted
          loop
          preload="metadata"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-white/10" aria-hidden />
      <video
        ref={videoRef}
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
        onWaiting={startStall}
        onPlaying={endStall}
        onError={(e) =>
          reportPlaybackEvent(clip.id, {
            event: "error",
            ...playerState(e.currentTarget, clip.url),
          })
        }
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
        // The tilt needs its own wrapper: heart-pop rewrites transform on the
        // element it animates, so a rotate there would be thrown away.
        <span
          className="pointer-events-none absolute"
          style={{
            left: heartBurst.x,
            top: heartBurst.y,
            animation: "heart-pop 600ms ease-out forwards",
          }}
        >
          <svg
            className="block text-red-500/90"
            style={{ transform: `rotate(${heartBurst.tilt}deg)` }}
            width="96"
            height="96"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21s-6.7-4.3-9.3-8C.8 10.2 1.7 6.6 4.6 5.3 6.6 4.4 9 5 12 8c3-3 5.4-3.6 7.4-2.7 2.9 1.3 3.8 4.9 1.9 7.7-2.6 3.7-9.3 8-9.3 8z" />
          </svg>
        </span>
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
            rel="noopener noreferrer"
            onClick={(event) => {
              // iOS ignores target="_blank" once installed to the home screen.
              event.preventDefault();
              window.open(event.currentTarget.href, "_blank", "noopener");
            }}
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
          onClick={copyLink}
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
          <span className="text-xs">
            {copied ? "Copied" : formatCount(counts.shares)}
          </span>
        </button>
      </div>
      <div
        className="absolute left-4 right-20 z-10 text-white drop-shadow"
        style={{ bottom: `calc(${NAV_HEIGHT} + 0.75rem)` }}
      >
        <p className="font-semibold">@{seededHandle(clip.id)}</p>
        {clip.series_title && (
          <p className="mt-1 text-sm">#{clip.series_title}</p>
        )}
        <p className="mt-1 text-sm text-white/85">
          {clip.episode} · from {formatTimestamp(clip.start_sec)}
        </p>
      </div>
      <SeekBar videoRef={videoRef} progress={progress} />
    </section>
  );
}
