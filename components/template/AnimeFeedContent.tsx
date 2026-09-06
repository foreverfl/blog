"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listClips, recordView, type ClipResponse } from "@/lib/anime/api";
import { useAuth } from "@/lib/context/auth-context";

function ClipSlide({
  clip,
  soundOn,
  volume,
  onVolumeChange,
  onView,
}: {
  clip: ClipResponse;
  soundOn: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onView: (id: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropRef = useRef<HTMLVideoElement>(null);

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
    if (!video) return;
    video.muted = !soundOn;
    video.volume = volume;
  }, [soundOn, volume]);

  return (
    <section className="relative flex h-dvh w-full snap-start items-center justify-center overflow-hidden">
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
        controls
        preload="metadata"
        onVolumeChange={(e) => onVolumeChange(e.currentTarget.volume)}
        onPlay={() => backdropRef.current?.play().catch(() => {})}
        onPause={() => backdropRef.current?.pause()}
      />
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
  const [volume, setVolume] = useState(1);
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
              volume={volume}
              onVolumeChange={setVolume}
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
          onClick={() => setSoundOn(true)}
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
