"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LanguageRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const userLang = navigator.language.startsWith("ko") ? "ko" : "ja"; // 사용자의 언어 감지
    router.replace(`/${userLang}`); // 언어에 따라 리다이렉트
  }, [router]);

  return null; // 화면에는 아무것도 렌더링하지 않음
};

export default LanguageRedirect;
