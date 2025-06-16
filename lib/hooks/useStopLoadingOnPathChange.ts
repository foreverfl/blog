"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoadingDispatch } from "@/lib/context/loading-context";

export function useStopLoadingOnPathChange() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const dispatch = useLoadingDispatch();

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      dispatch({ type: "STOP_LOADING" });
      prevPathRef.current = pathname;
    }
  }, [pathname, dispatch]);
}
