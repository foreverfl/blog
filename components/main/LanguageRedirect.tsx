"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LanguageRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const userLang = navigator.language.startsWith("ko") ? "ko" : "ja";
    router.replace(`/${userLang}`);
  }, [router]);

  return null;
};

export default LanguageRedirect;
