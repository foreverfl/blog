"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const userLang = navigator.language.startsWith("ko") ? "ko" : "ja"; // 사용자의 언어를 감지
    router.replace(`/${userLang}`); // 사용자의 언어에 따라 리다이렉트
  }, [router]);

  return null;
}
