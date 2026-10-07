import PlaceDetailTable from "@/components/organism/map/PlaceDetailTable";
import type { Place } from "@/lib/map/places";
import { useEffect, useRef } from "react";

type PlaceModalProps = {
  /** The place to show, or null to keep the dialog closed. */
  place: Place | null;
  onClose: () => void;
};

/**
 * Native dialog for one place: photo on top, the name linking to the hotel site, then the field table.
 *
 * @param props - { place, onClose }
 * @returns the dialog, open whenever place is not null
 */
export default function PlaceModal({ place, onClose }: PlaceModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native dialog imperatively from the declarative `place` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (place && !dialog.open) dialog.showModal();
    else if (!place && dialog.open) dialog.close();
  }, [place]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[95vw] max-w-xl rounded-lg bg-white p-0 text-gray-900 backdrop:bg-black/50 dark:bg-[#090909] dark:text-gray-100"
    >
      <div className="p-6">
        {place?.image_url && (
          <img
            src={place.image_url}
            alt={place.name}
            className="mb-4 max-h-64 w-full rounded object-cover"
          />
        )}
        <h2 className="text-lg font-bold">
          {place?.site_url ? (
            <a
              href={place.site_url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {place.name}
            </a>
          ) : (
            place?.name
          )}
        </h2>
        {place && (
          <div className="mt-4">
            <PlaceDetailTable place={place} />
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
