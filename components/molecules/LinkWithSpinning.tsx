"use client";

import { useLoadingDispatch } from "@/lib/context/loading-context";
import React from "react";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// MPA navigation: let the browser follow the <a>; the spinner shows until the
// full page reload swaps the document.
export default function LinkWithSpinning({
  href,
  children,
  className,
  onClick,
}: Props) {
  const dispatch = useLoadingDispatch();

  const handleClick = () => {
    dispatch({ type: "START_LOADING" });
    if (onClick) onClick();
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
