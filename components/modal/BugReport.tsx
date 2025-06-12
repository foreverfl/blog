"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const BugReport = () => {
  const { t, i18n } = useTranslation();

  const pathname = usePathname();
  const parts = pathname.split("/");
  const lan = pathname.split("/")[1];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/discord/bug-bounty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("API error");
      setStatus("success");
      setTitle("");
      setContent("");
    } catch {
      setStatus("error");
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
        {status === "success" && (
          <p className="text-green-600 mt-2">{t("bug_report_form_success")}</p>
        )}
        {status === "error" && (
          <p className="text-red-600 mt-2">{t("bug_report_form_error")}</p>
        )}
      </form>
    </div>
  );
};

export default BugReport;
