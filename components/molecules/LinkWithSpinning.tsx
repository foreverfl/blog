"use client";

import { useRouter } from "next/navigation";
import { useLoadingDispatch } from "@/lib/context/loading-context";
import React from "react";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function LinkWithSpinning({
  href,
  children,
  className,
  onClick,
}: Props) {
  const router = useRouter();
  const dispatch = useLoadingDispatch();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch({ type: "START_LOADING" });
    if (onClick) onClick();
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
