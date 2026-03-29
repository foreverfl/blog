"use client";

import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki/bundle/web";

interface CodeBlockProps {
  language: string;
  children: string;
}

const shikiDarkStyle = `
.dark .shiki,
.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
`;

const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    codeToHtml(children, {
      lang: language || "text",
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
    })
      .then(setHtml)
      .catch(() => {
        // fallback for unsupported languages
        codeToHtml(children, {
          lang: "text",
          themes: {
            light: "github-light-default",
            dark: "github-dark-default",
          },
        }).then(setHtml);
      });
  }, [children, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <style>{shikiDarkStyle}</style>
      {/* Header: language label + copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-mono uppercase">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          {copied ? (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code body */}
      {html ? (
        <div
          className="[&_pre]:m-0! [&_pre]:rounded-none! [&_pre]:p-4! [&_pre]:text-sm! [&_code]:text-sm!"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="m-0 p-4 text-sm bg-neutral-50 dark:bg-neutral-900 overflow-x-auto">
          <code>{children}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
