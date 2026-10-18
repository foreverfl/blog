import type { PlaceFilter } from "@/lib/map/places";

type FilterChipsProps = {
  /** Subcategory chips to offer; none are drawn when there is only one. */
  subcategories: string[];
  value: PlaceFilter;
  onChange: (filter: PlaceFilter) => void;
};

const ON =
  "rounded-full bg-gray-700 px-3 py-0.5 text-white dark:bg-slate-50 dark:text-black";
const OFF =
  "rounded-full border border-gray-400 px-3 py-0.5 dark:border-gray-600";

/**
 * Row of toggle chips under the dropdown: Visitable, Visited, then one per
 * subcategory. Each chip flips its own flag; subcategories combine with OR.
 *
 * @param props - { subcategories: ["gin", "whisky"], value, onChange }
 * @returns the chip row
 */
export default function FilterChips({
  subcategories,
  value,
  onChange,
}: FilterChipsProps) {
  const toggleSubcategory = (name: string) => {
    const next = value.subcategories.includes(name)
      ? value.subcategories.filter((chosen) => chosen !== name)
      : [...value.subcategories, name];
    onChange({ ...value, subcategories: next });
  };
  const chips = subcategories.length > 1 ? subcategories : [];

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button
        type="button"
        className={value.visitableOnly ? ON : OFF}
        onClick={() =>
          onChange({ ...value, visitableOnly: !value.visitableOnly })
        }
      >
        Visitable
      </button>
      <button
        type="button"
        className={value.visitedOnly ? ON : OFF}
        onClick={() => onChange({ ...value, visitedOnly: !value.visitedOnly })}
      >
        Visited
      </button>
      {chips.map((name) => (
        <button
          key={name}
          type="button"
          className={value.subcategories.includes(name) ? ON : OFF}
          onClick={() => toggleSubcategory(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
