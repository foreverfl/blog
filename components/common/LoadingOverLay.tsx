"use client";

import Spinner from "@/components/atom/Spinner";
import {
  useLoadingDispatch,
  useLoadingState,
} from "@/lib/context/loading-context";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function LoadingOverlay() {
  const pathname = usePathname();
  const { isLoading } = useLoadingState();
  const dispatch = useLoadingDispatch();

  useEffect(() => {
    dispatch({ type: "START_LOADING" });

    const timer = setTimeout(() => {
      dispatch({ type: "STOP_LOADING" });
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-sm">
      <Spinner />
    </div>
  );
}
