"use client";

import AnimeList from "@/components/organism/anime/AnimeList";
import { useAuth } from "@/lib/context/auth-context";

export default function Page() {
  const { isReady, isAdmin } = useAuth();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-400 animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-3/5">
        {isAdmin ? (
          <AnimeList />
        ) : (
          <div className="text-center text-gray-500 mt-20">Access denied</div>
        )}
      </div>
    </div>
  );
}
