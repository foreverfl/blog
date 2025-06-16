"use client";

import { useRouter } from "next/navigation";
import { useLoadingDispatch } from "@/lib/context/loading-context";
import React from "react";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function LinkWithSpinning({ href, children, className }: Props) {
  const router = useRouter();
  const dispatch = useLoadingDispatch();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch({ type: "START_LOADING" });
    setTimeout(() => {
      router.push(href);
    }, 0);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
