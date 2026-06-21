"use client";

import { useEffect } from "react";
import { useLoadingDispatch } from "@/lib/context/loading-context";

// bfcache restore re-shows the spinner without re-running effects; pageshow
// always fires there, so stop loading on it.
export function useStopLoadingOnPageShow() {
  const dispatch = useLoadingDispatch();

  useEffect(() => {
    const stop = () => dispatch({ type: "STOP_LOADING" });
    window.addEventListener("pageshow", stop);
    return () => window.removeEventListener("pageshow", stop);
  }, [dispatch]);
}
