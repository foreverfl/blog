import { saveMyVisit } from "@/lib/map/api";
import type { Place, PlaceVisitBody } from "@/lib/map/places";
import { queryClient } from "@/lib/query/query";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const LABEL = "w-32 shrink-0 py-1.5 text-gray-500 dark:text-gray-400";
const INPUT =
  "w-full rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600";

/** Empty inputs are sent as null, never as "". */
function orNull(value: string): string | null {
  return value === "" ? null : value;
}

/**
 * My record for one place with a Save button that PUTs it and refreshes the
 * mine query. ITS places get applied_count and last_applied_on on top of
 * visited_on and visited_with; review has no input and is sent back as is.
 * Mount with key={place.id} so a new place starts from its own values.
 *
 * @param props - { place: a merged place; its record fields seed the inputs }
 * @returns the form, read from and written to GET/PUT /places/{id}/mine
 */
export default function MyRecordForm({ place }: { place: Place }) {
  const isIts = place.subcategory === "its";
  const [appliedCount, setAppliedCount] = useState(
    String(place.applied_count ?? 0),
  );
  const [lastAppliedOn, setLastAppliedOn] = useState(
    place.last_applied_on ?? "",
  );
  const [visitedOn, setVisitedOn] = useState(place.visited_on ?? "");
  const [visitedWith, setVisitedWith] = useState(place.visited_with ?? "");

  const save = useMutation({
    mutationFn: (body: PlaceVisitBody) => saveMyVisit(place.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places", "mine"] });
    },
  });

  return (
    <form
      className="mt-4 space-y-2 text-sm"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate({
          applied_count: isIts ? Number(appliedCount) : 0,
          last_applied_on: isIts ? orNull(lastAppliedOn) : null,
          visited_on: orNull(visitedOn),
          visited_with: orNull(visitedWith),
          review: place.review ?? null,
        });
      }}
    >
      {isIts && (
        <label className="flex gap-2">
          <span className={LABEL}>applied_count</span>
          <input
            type="number"
            min={0}
            className={INPUT}
            value={appliedCount}
            onChange={(event) => setAppliedCount(event.target.value)}
          />
        </label>
      )}
      {isIts && (
        <label className="flex gap-2">
          <span className={LABEL}>last_applied_on</span>
          <input
            type="date"
            className={INPUT}
            value={lastAppliedOn}
            onChange={(event) => setLastAppliedOn(event.target.value)}
          />
        </label>
      )}
      <label className="flex gap-2">
        <span className={LABEL}>visited_on</span>
        <input
          type="date"
          className={INPUT}
          value={visitedOn}
          onChange={(event) => setVisitedOn(event.target.value)}
        />
      </label>
      <label className="flex gap-2">
        <span className={LABEL}>visited_with</span>
        <input
          type="text"
          className={INPUT}
          value={visitedWith}
          onChange={(event) => setVisitedWith(event.target.value)}
        />
      </label>
      <div className="flex items-center justify-end gap-3">
        {save.isError && (
          <span className="text-red-500">{save.error.message}</span>
        )}
        {save.isSuccess && <span className="text-gray-500">Saved</span>}
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}
