import type { Place } from "@/lib/map/places";
import { select } from "d3";
import { useEffect, useRef } from "react";

// Shown as the title, the photo, or the title link, so not repeated as rows.
const SKIPPED_KEYS = new Set(["id", "name", "group", "image_url", "site_url"]);
const CELL =
  "border-b border-gray-700 px-3 py-1.5 text-left dark:border-gray-600";

/**
 * Two-column key/value table of one place. React owns the table shell; D3
 * owns the rows through a data join keyed by field name.
 *
 * @param props - { place: the selected place }
 * @returns a table with one row per field, "—" for missing values
 */
export default function PlaceDetailTable({ place }: { place: Place }) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    const rows = Object.entries(place)
      .filter(([key]) => !SKIPPED_KEYS.has(key))
      .map(([key, value]) => ({ key, value: value ?? "—" }));

    const cells = select(bodyRef.current)
      .selectAll<HTMLTableRowElement, { key: string; value: unknown }>("tr")
      .data(rows, (row) => row.key)
      .join("tr")
      .selectAll<HTMLTableCellElement, { key: string; value: unknown }>("td")
      .data((row) => [row, row])
      .join("td")
      .attr("class", CELL);

    cells.filter((_, index) => index === 0).text((row) => row.key);
    cells
      .filter((_, index) => index === 1)
      .html((row) => {
        const text = String(row.value);
        if (!text.startsWith("http")) return text;
        return `<a href="${text}" target="_blank" rel="noreferrer" class="underline">${text}</a>`;
      });
  }, [place]);

  return (
    <table className="w-full text-sm">
      <tbody ref={bodyRef} />
    </table>
  );
}
