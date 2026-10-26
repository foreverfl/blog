import RepoModal from "@/components/github/RepoModal";
import "@/lib/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type RepoRow = {
  rank: number;
  full_name: string;
  url: string;
  description: string | null;
  stars: number;
  language: string | null;
  repo_created_at: string;
  kind: string | null;
  languages: string[];
};

// FAKE: replaced by GET /github/categories and GET /github/{category}/latest when the backend is wired.
const TABS = ["overall"];
const FAKE_LANGUAGES = ["TypeScript", "Python", "Rust", "Go", null];
const FAKE_REPOS: RepoRow[] = Array.from({ length: 100 }, (_, index) => ({
  rank: index + 1,
  full_name: `owner-${index + 1}/repo-${index + 1}`,
  url: `https://github.com/owner-${index + 1}/repo-${index + 1}`,
  description:
    index % 7 === 0 ? null : `Fake description for repo ${index + 1}`,
  stars: 400000 - index * 3500,
  language: FAKE_LANGUAGES[index % FAKE_LANGUAGES.length],
  repo_created_at: `20${String(10 + (index % 15)).padStart(2, "0")}-04-01T00:00:00Z`,
  kind: index % 3 === 0 ? null : "ai-llm",
  languages: index % 3 === 0 ? [] : ["TypeScript", "Rust", "Shell"],
}));

const CELL =
  "border-b border-gray-700 px-3 py-2 text-left dark:border-gray-600";

/**
 * Today's GitHub ranking: one tab per category, a one-line row per repo, 100 rows at once.
 *
 * @param props - { lan: "ko" | "en" | "ja" from the URL }
 * @returns the tab row and the ranking table
 */
export default function GithubRank({ lan }: { lan: string }) {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(lan);
  }, [lan, i18n]);
  const [tab, setTab] = useState(TABS[0]);
  const [selected, setSelected] = useState<RepoRow | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex gap-2 text-sm">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={
              key === tab
                ? "rounded-md bg-gray-700 px-3 py-1 text-white dark:bg-slate-50 dark:text-black"
                : "rounded-md border border-gray-400 px-3 py-1 dark:border-gray-600"
            }
          >
            {key}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={CELL}>{t("github_col_rank")}</th>
              <th className={CELL}>{t("github_col_name")}</th>
              <th className={CELL}>{t("github_col_stars")}</th>
              <th className={CELL}>{t("github_col_language")}</th>
              <th className={CELL}>{t("github_col_description")}</th>
            </tr>
          </thead>
          <tbody>
            {FAKE_REPOS.map((repo) => (
              <tr
                key={repo.full_name}
                onClick={() => setSelected(repo)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <td className={CELL}>{repo.rank}</td>
                <td className={CELL}>{repo.full_name}</td>
                <td className={CELL}>{repo.stars.toLocaleString("en-US")}</td>
                <td className={CELL}>{repo.language ?? "—"}</td>
                <td className={`${CELL} max-w-md truncate`}>
                  {repo.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RepoModal repo={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
