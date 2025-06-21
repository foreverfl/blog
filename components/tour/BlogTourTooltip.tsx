import { TooltipRenderProps } from "react-joyride";

function BlogTourTooltip(props: TooltipRenderProps) {
  const { step, closeProps, primaryProps, backProps, skipProps } = props;

  return (
    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl px-6 py-5 pt-10 min-w-[260px] max-w-[320px] border border-gray-100 dark:border-neutral-800">
      {/* Close Button */}
      <button
        {...closeProps}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
        aria-label="Close tour"
        type="button"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <path
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Content */}
      <div className="text-base text-gray-900 dark:text-gray-100">
        {step.content}
      </div>

      {/* Control Button */}
      <div className="flex gap-2 mt-6 justify-end">
        {backProps && (
          <button
            {...backProps}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
            type="button"
          >
            Back
          </button>
        )}
        {primaryProps && (
          <button
            {...primaryProps}
            className="px-4 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            type="button"
          >
            Next
          </button>
        )}
        {step.showSkipButton && skipProps && (
          <button
            {...skipProps}
            className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 bg-white hover:bg-red-50 transition"
            type="button"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

export default BlogTourTooltip;
