"use client";

import { useEffect, useRef, useState } from "react";

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
}

export default function PromptModal({
  open,
  onOpenChange,
  title,
  description,
  initialValue = "",
  placeholder,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
}: PromptModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initialValue);

  // Drive the native dialog imperatively from the declarative `open` prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setValue(initialValue);
      dialog.showModal();
      textareaRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialValue]);

  const handleConfirm = () => {
    onConfirm(value);
    onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        // ESC closes natively; keep the `open` prop as the single source of truth
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false);
      }}
      className="m-auto w-[95vw] max-w-sm rounded-lg p-0 bg-white text-gray-900 dark:bg-[#090909] dark:text-gray-100 backdrop:bg-black/50"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="mt-4 w-full rounded border border-gray-300 dark:border-neutral-700 bg-transparent p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
