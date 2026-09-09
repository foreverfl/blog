"use client";

import { useEffect, useRef } from "react";

/**
 * A zero-height marker that calls back once it scrolls into view.
 *
 * @param onHit - runs when the marker becomes visible; keep it stable, since a
 *                new identity re-arms the observer
 */
export default function LoadMoreSentinel({ onHit }: { onHit: () => void }) {
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
