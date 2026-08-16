"use client";

import { useAuth } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";
import "@/lib/i18n";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const DATE_LOCALES: Record<string, string> = {
  ko: "ko-KR",
  ja: "ja-JP",
  en: "en-US",
};

const panelClass =
  "rounded border border-gray-300 p-4 dark:border-gray-600 dark:bg-neutral-900";

const placeholderClass = "text-sm text-gray-500 dark:text-gray-400";

const buttonClass =
  "rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600";

// Calorie tracking dashboard (skeleton — status card, calendar and detail panel
// are empty until their own units land).
const DietContent: React.FC = () => {
  const { isReady, isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { t, i18n } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // This page sits outside /{lan}/, so the locale comes from the cookie the
  // navbar's language selector writes.
  useEffect(() => {
    const chosen = document.cookie.match(/(?:^|;\s*)lan=([^;]+)/)?.[1];
    if (chosen && chosen in DATE_LOCALES) i18n.changeLanguage(chosen);
  }, [i18n]);

  // Wait for the auth check so a logged-in visitor never sees the login prompt.
  if (!isReady) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>{t("diet_login_required")}</p>
        <button className={buttonClass} onClick={openLoginModal}>
          {t("login_title")}
        </button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(
    DATE_LOCALES[i18n.language] ?? "ko-KR",
    { month: "long", day: "numeric" },
  );

  // Detail panel: the picked day's activity, meals and balance.
  const detailPanel = (
    <section className={panelClass}>
      <h2 className="font-bold">{today}</h2>
      <p className={placeholderClass}>{t("diet_detail_placeholder")}</p>
    </section>
  );

  return (
    <div className="flex min-h-screen justify-center">
      <div className="my-56 w-full px-5 md:w-4/5">
        {/* Status card: today's numbers and the two settings modals. */}
        <section className={panelClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Diet</h1>
              <p className={placeholderClass}>{t("diet_status_placeholder")}</p>
            </div>
            <div className="flex gap-2">
              <button className={buttonClass} disabled>
                {t("diet_edit_profile")}
              </button>
              <button className={buttonClass} disabled>
                {t("diet_tdee_settings")}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-[3fr_2fr]">
          {/* Calendar: one cell per day, weight and balance inside it. */}
          <section className={panelClass}>
            <h2 className="font-bold">{t("diet_calendar")}</h2>
            <p className={placeholderClass}>{t("diet_calendar_placeholder")}</p>
          </section>
          <div className="hidden md:block">{detailPanel}</div>
        </div>
      </div>

      {/* On mobile the detail panel is a bottom sheet instead of a column. */}
      <div className="fixed inset-x-0 bottom-0 md:hidden">
        <button
          className="w-full border-t border-gray-300 bg-white px-5 py-3 text-left text-sm dark:border-gray-600 dark:bg-neutral-900"
          onClick={() => setIsSheetOpen((open) => !open)}
        >
          {today} {isSheetOpen ? "▾" : "▴"}
        </button>
        {isSheetOpen && <div className="px-5 pb-5">{detailPanel}</div>}
      </div>
    </div>
  );
};

export default DietContent;
