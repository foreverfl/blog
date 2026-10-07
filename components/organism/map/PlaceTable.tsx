import { PLACE_GROUPS, type Place } from "@/lib/map/places";
import { select } from "d3";
import { useEffect, useRef } from "react";

const CELL =
  "border-b border-gray-700 px-3 py-2 text-left dark:border-gray-600";

/**
 * Table of the given places. React owns the table shell; D3 owns the rows
 * inside tbody through a data join keyed by place id.
 *
 * @param props - { places: the group currently chosen on the map }
 * @returns a 4-column table (name, group, lat, lng)
 */
export default function PlaceTable({ places }: { places: Place[] }) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    const groupLabel = (place: Place) =>
      PLACE_GROUPS.find((group) => group.value === place.group)?.label ??
      place.group;

    select(bodyRef.current)
      .selectAll<HTMLTableRowElement, Place>("tr")
      .data(places, (place) => place.id)
      .join("tr")
      .selectAll<HTMLTableCellElement, string>("td")
      .data((place) => [
        place.name,
        groupLabel(place),
        place.lat.toFixed(6),
        place.lng.toFixed(6),
      ])
      .join("td")
      .attr("class", CELL)
      .text((cell) => cell);
  }, [places]);

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className={CELL}>Name</th>
            <th className={CELL}>Group</th>
            <th className={CELL}>Lat</th>
            <th className={CELL}>Lng</th>
          </tr>
        </thead>
        <tbody ref={bodyRef} />
      </table>
    </div>
  );
}
