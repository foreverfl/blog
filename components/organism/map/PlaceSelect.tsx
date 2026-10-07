import { PLACE_GROUPS, type PlaceGroup } from "@/lib/map/places";

type PlaceSelectProps = {
  value: PlaceGroup;
  onChange: (group: PlaceGroup) => void;
};

/**
 * Native dropdown that picks which group of places the map shows.
 *
 * @param props - { value: "its", onChange }
 * @returns a select listing ITS · UR · Visited
 */
export default function PlaceSelect({ value, onChange }: PlaceSelectProps) {
  return (
    <select
      aria-label="Place group"
      value={value}
      onChange={(event) => onChange(event.target.value as PlaceGroup)}
      className="rounded-md border border-gray-400 bg-white px-2 py-1 text-sm text-black dark:border-gray-600 dark:bg-neutral-900 dark:text-slate-50"
    >
      {PLACE_GROUPS.map((group) => (
        <option key={group.value} value={group.value}>
          {group.label}
        </option>
      ))}
    </select>
  );
}
