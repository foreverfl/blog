import type { RepoRow } from "@/components/github/GithubRank";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type RepoModalProps = {
  /** The repo to show, or null to keep the dialog closed. */
  repo: RepoRow | null;
  onClose: () => void;
};

/**
 * Native dialog for one repo row: the name linking to GitHub, full description, category, languages, stars and creation date.
 *
 * @param props - { repo, onClose }
 * @returns the dialog, open whenever repo is not null
 */
export default function RepoModal({ repo, onClose }: RepoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (repo && !dialog.open) dialog.showModal();
    else if (!repo && dialog.open) dialog.close();
  }, [repo]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[95vw] max-w-xl rounded-lg bg-white p-0 text-gray-900 backdrop:bg-black/50 dark:bg-[#090909] dark:text-gray-100"
    >
      {repo && (
        <div className="p-6">
          <h2 className="text-lg font-bold">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {repo.full_name}
            </a>
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">
            {repo.description ?? "—"}
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt>{t("github_field_kind")}</dt>
            <dd>{repo.kind ?? "—"}</dd>
            <dt>{t("github_col_language")}</dt>
            <dd>
              {repo.languages.length > 0 ? repo.languages.join(", ") : "—"}
            </dd>
            <dt>{t("github_col_stars")}</dt>
            <dd>{repo.stars.toLocaleString("en-US")}</dd>
            <dt>{t("github_field_created_at")}</dt>
            <dd>{repo.repo_created_at.slice(0, 10)}</dd>
          </dl>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
