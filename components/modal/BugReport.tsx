"use client";

import "@/lib/i18n";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface BugReportProps {
  onClose?: () => void;
}

const BugReport: FC<BugReportProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();

  const pathname = usePathname();
  const parts = pathname.split("/");
  const lan = pathname.split("/")[1];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/discord/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bug_report",
          title,
          content,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setTitle("");
      setContent("");
      alert(t("bug_report_form_success"));
      if (onClose) onClose();
    } catch {
      alert(t("bug_report_form_error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (["ko", "ja", "en"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">{t("bug_report_title")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
    </div>
  );
};

export default BugReport;
