"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type LangType = "en" | "ko" | "ja";

const langPathMap = {
  en: "/policy/privacy-policy.en.html",
  ko: "/policy/privacy-policy.ko.html",
  ja: "/policy/privacy-policy.ja.html",
};

function detectLang(pathname: string): LangType {
  if (pathname.startsWith("/ko")) return "ko";
  if (pathname.startsWith("/ja")) return "ja";
  return "en";
}

export default function PrivacyPolicyEn() {
  const pathname = usePathname();
  const [html, setHtml] = useState("");
  const lang = detectLang(pathname);

  useEffect(() => {
    fetch(langPathMap[lang])
      .then((res) => res.text())
      .then(setHtml);
  }, [lang]);

  return (
    <div className="privacy-policy p-6 bg-white dark:bg-[#090909] text-gray-900 dark:text-gray-100 mx-auto">
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
