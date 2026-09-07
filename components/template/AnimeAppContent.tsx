"use client";

import { useState } from "react";

import BottomNav, {
  type AnimeScreen,
} from "@/components/organism/anime/BottomNav";
import AnimeFeedContent from "@/components/template/AnimeFeedContent";
import AnimeProfileContent from "@/components/template/AnimeProfileContent";
import { useAuth } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";

// The tab bar sits above both screens, so who may see them is decided here.
export default function AnimeAppContent() {
  const { isReady, isLoggedIn, isAdmin } = useAuth();
  const { openLoginModal } = useLoginModal();
  const [screen, setScreen] = useState<AnimeScreen>("feed");

  if (!isReady) return null;

  // Installed on the home screen, this opens with an expired session often
  // enough that a dead end would read as a broken app.
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-sm text-white/70">Sign in to continue</p>
        <button
          type="button"
          onClick={openLoginModal}
          className="rounded-full bg-white px-6 py-2 font-semibold text-black"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-white">
        <p>Page not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Kept mounted rather than swapped out, so leaving the feed does not
          lose the scroll position and restart the clip. */}
      <div hidden={screen !== "feed"}>
        <AnimeFeedContent />
      </div>
      {screen === "profile" && <AnimeProfileContent />}
      <BottomNav screen={screen} onSelect={setScreen} />
    </>
  );
}
