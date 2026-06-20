"use client";

import { useLoadingDispatch } from "@/lib/context/loading-context";
import { useClientPathname } from "@/lib/hooks/useClientPathname";
import React, { useState } from "react";

interface SetLanguageProps {
  id?: string;
}

const SetLanguage: React.FC<SetLanguageProps> = ({
  id = "language-select",
}) => {
  const pathname = useClientPathname();
  const dispatch = useLoadingDispatch();

  const [currentLanguage, setCurrentLanguage] = useState(
    pathname.split("/")[1],
  );

  const handleLanguageChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newLanguage = e.target.value;
    setCurrentLanguage(newLanguage);

    const pathParts = pathname.split("/");
    // first part
    pathParts[1] = newLanguage;

    // last part
    const last = pathParts[pathParts.length - 1];
    const slugLangMatch = last.match(/-(ko|ja|en)$/);
    if (slugLangMatch) {
      const newSlug = last.replace(/-(ko|ja|en)$/, `-${newLanguage}`);
      pathParts[pathParts.length - 1] = newSlug;
    }

    // combine the path parts
    const newPathname = pathParts.join("/");

    // Persist the chosen locale (used by the root redirect script)
    document.cookie = `lan=${newLanguage}; path=/; max-age=${60 * 60 * 24 * 30}`;

    // Dispatch loading action
    dispatch({ type: "START_LOADING" });

    // MPA navigation: full page reload to the new locale path
    window.location.assign(newPathname);
  };

  return (
    <>
      <select
        id={id}
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="p-2 text-black dark:text-white bg-gray-200 dark:bg-neutral-900 rounded"
      >
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="ko">한국어</option>
      </select>
    </>
  );
};

export default SetLanguage;
