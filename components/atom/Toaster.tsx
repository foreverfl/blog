"use client";

import { Toast, ToastType, useToast } from "@/lib/context/toast-context";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const AUTO_DISMISS_MS = 4000;

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-800 text-white dark:bg-gray-700",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ duration: 0.2 }}
      className={`flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${typeStyles[toast.type]}`}
    >
      <span className="text-sm">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto text-lg leading-none opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        ×
      </button>
    </motion.div>
  );
}

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
