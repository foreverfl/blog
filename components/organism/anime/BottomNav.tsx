"use client";

import type { ReactNode } from "react";

export type AnimeScreen = "feed" | "profile";

// Slide overlays read this so they can sit clear of the fixed bar.
export const NAV_HEIGHT = "calc(3.5rem + env(safe-area-inset-bottom))";

function NavButton({
  label,
  active,
  badge,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
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

// Only ホーム and プロフィール go anywhere; the rest are looks only, and the
// plus keeps TikTok's cyan/red offset blocks.
export default function BottomNav({
  screen,
  onSelect,
}: {
  screen: AnimeScreen;
  onSelect: (screen: AnimeScreen) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around bg-black"
      style={{
        height: NAV_HEIGHT,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <NavButton
        label="ホーム"
        active={screen === "feed"}
        onClick={() => onSelect("feed")}
      >
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
      <NavButton
        label="プロフィール"
        active={screen === "profile"}
        onClick={() => onSelect("profile")}
      >
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
