"use client";

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
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          shapeRendering="geometricPrecision"
          viewBox="0 0 24 24"
          height="16"
          width="16"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>

      <button
        onClick={onExternalLink}
        aria-label="Open on Hacker News"
        className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          shapeRendering="geometricPrecision"
          viewBox="0 0 24 24"
          height="16"
          width="16"
        >
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>
    </div>
  );
}
