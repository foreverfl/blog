import type { ReactNode } from "react";

type MapPanelProps = {
  /** Controls drawn in the row above the panel. */
  toolbar?: ReactNode;
  children: ReactNode;
};

/**
 * Toolbar row plus a rounded panel under the fixed navbar (pt-20 like every
 * other page); the panel holds either the map or the sign-in prompt.
 *
 * @param props - { toolbar: controls above the panel, children: what goes inside it }
 * @returns the panel, centered and 70% of the viewport tall
 */
export default function MapPanel({ toolbar, children }: MapPanelProps) {
  return (
    <div className="px-4 pt-20 pb-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <div className="h-[70dvh] w-full overflow-hidden rounded-xl border border-gray-700 shadow-lg dark:border-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
}
