import { useTranslation } from "react-i18next";

export type MapView = "map" | "table";

type ViewToggleProps = {
  value: MapView;
  onChange: (view: MapView) => void;
};

const VIEWS: { value: MapView; labelKey: string }[] = [
  { value: "map", labelKey: "map_view_map" },
  { value: "table", labelKey: "map_view_table" },
];

/**
 * Two-button switch between the map and the table of the same places.
 *
 * @param props - { value: "map", onChange }
 * @returns the button pair, the active one filled
 */
export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="flex overflow-hidden rounded-md border border-gray-400 text-sm dark:border-gray-600">
      {VIEWS.map((view) => (
        <button
          key={view.value}
          type="button"
          onClick={() => onChange(view.value)}
          className={
            view.value === value
              ? "bg-gray-700 px-3 py-1 text-white dark:bg-slate-50 dark:text-black"
              : "px-3 py-1"
          }
        >
          {t(view.labelKey)}
        </button>
      ))}
    </div>
  );
}
