"use client";

import { useLoadingDispatch } from "@/lib/context/loading-context";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SetLanguageProps {
  id?: string;
}

const SetLanguage: React.FC<SetLanguageProps> = ({
  id = "language-select",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useLoadingDispatch();

  const [currentLanguage, setCurrentLanguage] = useState(
    pathname.split("/")[1],
  );
  const [isReady, setIsReady] = useState(false); // loading state

  useEffect(() => {
    setIsReady(true);
  }, []);

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

    try {
      await fetch(`/api/language/${newLanguage}`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to update language cookie", error);
    }

    // Dispatch loading action
    dispatch({ type: "START_LOADING" });

    // Use router to navigate to the new path
    router.push(newPathname, { scroll: false });
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
