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
    <section className="flex h-dvh w-full snap-start items-center justify-center">
      <video
        ref={videoRef}
        src={clip.url as string}
        className="h-full w-full object-contain"
        playsInline
        muted
        loop
        controls
        preload="metadata"
        onVolumeChange={(e) => onVolumeChange(e.currentTarget.volume)}
      />
    </section>
  );
}

export default function AnimeFeedContent() {
  const { isReady, isAdmin } = useAuth();
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolume] = useState(1);
  const viewedIds = useRef(new Set<number>());

  // Once per clip per page load — re-entering a slide doesn't recount.
  const markViewed = useCallback((id: number) => {
    if (viewedIds.current.has(id)) return;
    viewedIds.current.add(id);
    recordView(id).catch(() => {});
  }, []);

  const { data: clips, isLoading } = useQuery({
    queryKey: ["anime", "clips"],
    queryFn: () => listClips(false, 50),
    enabled: isReady && isAdmin,
    refetchOnWindowFocus: false, // random order: a refetch would reshuffle mid-scroll
  });

  if (!isReady) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Page not found</p>
      </div>
    );
  }

  const playable = (clips ?? []).filter((clip) => clip.url);

  return (
    <div className="relative h-dvh w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {isLoading ? null : playable.length ? (
        playable.map((clip) => (
          <ClipSlide
            key={clip.id}
            clip={clip}
            soundOn={soundOn}
            volume={volume}
            onVolumeChange={setVolume}
            onView={markViewed}
          />
        ))
      ) : (
        <p className="flex h-dvh items-center justify-center text-white">
          No clips
        </p>
      )}
      {!soundOn && !isLoading && playable.length > 0 && (
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
