"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LanguageRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const lang = navigator.language;

    let targetLang = "en";
    if (lang.startsWith("ja")) {
      targetLang = "ja";
    } else if (lang.startsWith("ko")) {
      targetLang = "ko";
    }

    router.replace(`/${targetLang}`);
  }, [router]);

  return null;
};

export default LanguageRedirect;
