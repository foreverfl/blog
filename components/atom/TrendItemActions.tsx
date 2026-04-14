"use client";

import { Copy, ExternalLink } from "@geist-ui/icons";

interface TrendItemActionsProps {
  isLiked: boolean;
  onToggleLike: () => void;
  onCopy: () => void;
  onExternalLink: () => void;
}

export default function TrendItemActions({
  isLiked,
  onToggleLike,
  onCopy,
  onExternalLink,
}: TrendItemActionsProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={onToggleLike}
        aria-pressed={isLiked}
        aria-label={isLiked ? "Unlike" : "Like"}
        className={`transition-colors ${
          isLiked
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
        }`}
      >
        <svg
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          shapeRendering="geometricPrecision"
          viewBox="0 0 24 24"
          height="16"
          width="16"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      <button
        onClick={onCopy}
        aria-label="Copy summary"
        className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Copy size={16} />
      </button>

      <button
        onClick={onExternalLink}
        aria-label="Open on Hacker News"
        className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ExternalLink size={16} />
      </button>
    </div>
  );
}
