"use client";

import { useLayoutEffect, useRef, useState } from "react";

import ClipSlide from "@/components/organism/anime/ClipSlide";
import { recordView, type ClipResponse } from "@/lib/anime/api";

// Sits under the tab bar rather than over it, so the slide's own bottom spacing
// (which reserves the bar's height) lines up instead of leaving a gap.
export default function AnimeSubFeedContent({
  clips,
  startIndex,
  onClose,
}: {
  clips: ClipResponse[];
  startIndex: number;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);

  // Before the first paint, so the tapped clip is what shows up.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = startIndex * el.clientHeight;
  }, [startIndex]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar fixed inset-0 z-10 snap-y snap-mandatory overflow-y-auto bg-black"
    >
      {clips.map((clip, index) => (
        <ClipSlide
          key={clip.id}
          clip={clip}
          index={index}
          active={index === activeIndex}
          near={Math.abs(index - activeIndex) <= 1}
          // Opening this took a tap, so unmuted autoplay is allowed; ClipSlide
          // falls back to muted if the browser still refuses.
          soundOn
          onActive={setActiveIndex}
          onView={(id) => {
            recordView(id).catch(() => {});
          }}
        />
      ))}
      <button
        type="button"
        aria-label="Back"
        onClick={onClose}
        className="fixed left-3 z-20 rounded-full bg-black/40 p-2 text-white backdrop-blur"
        style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 5 8 12l7 7" />
        </svg>
      </button>
    </div>
  );
}
