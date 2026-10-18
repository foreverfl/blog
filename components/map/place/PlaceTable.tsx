import type { Place, PlaceGroup } from "@/lib/map/places";
import { select } from "d3";
import { useEffect, useRef } from "react";

const CELL =
  "border-b border-gray-700 px-3 py-2 text-left dark:border-gray-600";

// What one night at any ITS facility costs the member.
const ITS_MEMBER_PRICE_YEN = 6600;

type Column = {
  header: string;
  cell: (place: Place) => string;
};

/** Formats a yen amount as "12,000", or "—" when unknown. */
function yen(amount: number | null | undefined): string {
  return amount == null ? "—" : amount.toLocaleString("ja-JP");
}

/** Market price minus the member price, or null when the market price is unknown. */
function savedYen(place: Place): number | null {
  if (place.market_price_yen == null) return null;
  return place.market_price_yen - ITS_MEMBER_PRICE_YEN;
}

const ITS_COLUMNS: Column[] = [
  { header: "Name", cell: (place) => place.name },
  {
    header: "Area",
    cell: (place) => [place.prefecture, place.city].filter(Boolean).join(" "),
  },
  { header: "Min party", cell: (place) => place.min_party?.toString() ?? "—" },
  { header: "Price", cell: (place) => yen(place.market_price_yen) },
  { header: "Saved", cell: (place) => yen(savedYen(place)) },
  { header: "Visited", cell: (place) => place.visited_on ?? "—" },
  {
    header: "Applied",
    cell: (place) => place.applied_count?.toString() ?? "—",
  },
];

const DEFAULT_COLUMNS: Column[] = [
  { header: "Name", cell: (place) => place.name },
  { header: "Kind", cell: (place) => place.subcategory ?? place.category },
  { header: "Lat", cell: (place) => place.lat.toFixed(6) },
  { header: "Lng", cell: (place) => place.lng.toFixed(6) },
];

type PlaceTableProps = {
  group: PlaceGroup;
  places: Place[];
  /** Called with the row's place when the row is clicked. */
  onSelect: (place: Place) => void;
};

/**
 * Table of the given places. React owns the table shell; D3 owns the rows
 * inside tbody through a data join keyed by place id. The ITS group gets
 * its own columns and a "saved so far" line above the table.
 *
 * @param props - { group: the dropdown group, places: its places, onSelect }
 * @returns the table, 7 columns for ITS and 4 (name, kind, lat, lng) otherwise
 */
export default function PlaceTable({
  group,
  places,
  onSelect,
}: PlaceTableProps) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const columns = group === "its" ? ITS_COLUMNS : DEFAULT_COLUMNS;
  const savedSoFar = places
    .filter((place) => place.visited_on !== null)
    .reduce((sum, place) => sum + (savedYen(place) ?? 0), 0);

  useEffect(() => {
    if (!bodyRef.current) return;
    select(bodyRef.current)
      .selectAll<HTMLTableRowElement, Place>("tr")
      .data(places, (place) => place.id)
      .join("tr")
      .attr(
        "class",
        "cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800",
      )
      .on("click", (_event, place) => onSelect(place))
      .selectAll<HTMLTableCellElement, string>("td")
      .data((place) => columns.map((column) => column.cell(place)))
      .join("td")
      .attr("class", CELL)
      .text((cell) => cell);
  }, [places, columns, onSelect]);

  return (
    <div className="h-full overflow-auto">
      {group === "its" && (
        <p className="px-3 py-2 text-sm">Saved so far: ¥{yen(savedSoFar)}</p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={CELL}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={bodyRef} />
      </table>
    </div>
  );
}
