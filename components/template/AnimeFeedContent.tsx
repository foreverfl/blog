"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/context/auth-context";
import { listClips } from "@/lib/anime/api";

// Personal TikTok-style clip feed (skeleton — plays the first clip only;
// snap scrolling and the rest come in later units).
export default function AnimeFeedContent() {
  const { isReady, isAdmin } = useAuth();

  const { data: clips, isLoading } = useQuery({
    queryKey: ["anime", "clips"],
    queryFn: () => listClips(false, 50),
    enabled: isReady && isAdmin,
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

  const firstClip = (clips ?? []).find((clip) => clip.url);

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-black">
      {isLoading ? null : firstClip ? (
        <video
          src={firstClip.url as string}
          className="h-full w-full object-contain"
          playsInline
          controls
          autoPlay
          muted
          loop
        />
      ) : (
        <p className="text-white">No clips</p>
      )}
    </div>
  );
}
