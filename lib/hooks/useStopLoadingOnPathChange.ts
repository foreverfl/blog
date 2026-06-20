"use client";

import { useEffect, useRef } from "react";
import { useClientPathname } from "@/lib/hooks/useClientPathname";
import { useLoadingDispatch } from "@/lib/context/loading-context";

export function useStopLoadingOnPathChange() {
  const pathname = useClientPathname();
  const prevPathRef = useRef(pathname);
  const dispatch = useLoadingDispatch();

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      dispatch({ type: "STOP_LOADING" });
      prevPathRef.current = pathname;
    }
  }, [pathname, dispatch]);
}
