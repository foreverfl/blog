"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { listClips, type ClipResponse } from "@/lib/anime/api";
import { useAuth } from "@/lib/context/auth-context";

// One full-screen slide; plays only while (mostly) on screen.
function ClipSlide({ clip }: { clip: ClipResponse }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can be blocked before the first tap — ignore and let
          // the controls handle it.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

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
      />
    </section>
  );
}

// Personal TikTok-style clip feed: vertical snap scroll, one clip per screen.
export default function AnimeFeedContent() {
  const { isReady, isAdmin } = useAuth();

  const { data: clips, isLoading } = useQuery({
    queryKey: ["anime", "clips"],
    queryFn: () => listClips(false, 50),
    enabled: isReady && isAdmin,
    // Random server order — a refocus refetch would reshuffle mid-scroll.
    refetchOnWindowFocus: false,
  });

  // Wait for the auth check to avoid a "not found" flash for the admin.
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
    <div className="h-dvh w-full snap-y snap-mandatory overflow-y-auto bg-black">
      {isLoading ? null : playable.length ? (
        playable.map((clip) => <ClipSlide key={clip.id} clip={clip} />)
      ) : (
        <p className="flex h-dvh items-center justify-center text-white">
          No clips
        </p>
      )}
    </div>
  );
}
