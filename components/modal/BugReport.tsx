"use client";

import "@/lib/i18n";
import { usePathname } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface BugReportProps {
  isOpen: boolean;
  setIsOpen?: (open: boolean) => void;
}

const BugReport: FC<BugReportProps> = ({ isOpen, setIsOpen }) => {
  const { t, i18n } = useTranslation();

  const pathname = usePathname();
  const parts = pathname.split("/");
  const lan = pathname.split("/")[1];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Turnstile authentication token is required
      const verifyRes = await fetch("/api/cloudflare/turnstile-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.ok) {
        alert("Verification failed: " + verifyJson.error);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/discord/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bug_report",
          turnstileToken,
          title,
          content,
        }),
      });
      if (!res.ok) throw new Error("API error");

      setTitle("");
      setContent("");
      setTurnstileToken("");

      alert(t("bug_report_form_success"));
      if (setIsOpen) setIsOpen(false);
    } catch {
      alert(t("bug_report_form_error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    // Register the Cloudflare Turnstile script only once
    if (!document.querySelector("#cf-turnstile-script")) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.id = "cf-turnstile-script";
      document.body.appendChild(script);
    }

    // Register the global callback for Turnstile token issuance
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
  }, []);

  useEffect(() => {
    if (["ko", "ja", "en"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">{t("bug_report_title")}</h2>

      {/* Turnstile Widget */}
      {!turnstileToken && (
        <div ref={turnstileRef}>
          <div
            key={isOpen ? "turnstile-open" : "turnstile-closed"}
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-callback="onTurnstileSuccess"
          ></div>
          <p className="mt-2 text-xs text-gray-500">
            {t("bug_report_form_turnstile_notice")}
          </p>
        </div>
      )}

      {/* Bug Report Form */}
      {turnstileToken && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* title */}
            <label className="block text-sm mb-1">
              {t("bug_report_form_title_label")}
            </label>
            <input
              required
              type="text"
              className="w-full border px-2 py-1 rounded dark:bg-neutral-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder={t("bug_report_form_title_placeholder")}
            />
          </div>

          {/* content */}
          <div>
            <label className="block text-sm mb-1">
              {t("bug_report_form_description_label")}
            </label>
            <textarea
              required
              className="w-full border px-2 py-1 rounded dark:bg-neutral-800 min-h-[80px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              placeholder={t("bug_report_form_description_placeholder")}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-600 text-white rounded px-4 py-1 hover:bg-rose-700 transition"
            >
              {loading
                ? t("bug_report_form_submitting")
                : t("bug_report_form_submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BugReport;
