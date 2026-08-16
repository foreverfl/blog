"use client";

import DietBalanceChart from "@/components/molecules/DietBalanceChart";
import { useEffect, useRef } from "react";

interface DietBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  closeLabel: string;
  burnLabel: string;
  intakeLabel: string;
  bandLabel: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

export default function DietBalanceModal({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  ...chartLabels
}: DietBalanceModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native dialog imperatively from the declarative `open` prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false);
      }}
      className="m-auto w-[95vw] max-w-xl rounded-lg bg-white p-0 text-gray-900 backdrop:bg-black/50 dark:bg-[#090909] dark:text-gray-100"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="mt-4">
          <DietBalanceChart {...chartLabels} />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
