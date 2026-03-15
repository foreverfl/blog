"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import "@/lib/i18n";
import type { Root, Element } from "hast";
import type { Plugin } from "unified";
import "github-markdown-css";

// Rehype plugin: attach data-source-line to top-level block elements
const rehypeSourceLine: Plugin<[], Root> = () => {
  return (tree) => {
    for (const node of tree.children) {
      if (node.type === "element") {
        const el = node as Element;
        if (el.position?.start.line != null) {
          el.properties = el.properties || {};
          el.properties["dataSourceLine"] = el.position.start.line;
        }
      }
    }
  };
};

export default function WritePage() {
  const pathname = usePathname();
  const lan = pathname.split("/")[1];
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(lan);
  }, [lan, i18n]);

  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const rehypePlugins = useMemo(() => [rehypeSlug, rehypeSourceLine], []);

  // Calculate the top visible line number from editor scrollTop
  const getEditorTopLine = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return 1;
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
    return Math.floor(editor.scrollTop / lineHeight) + 1;
  }, []);

  // Line-based scroll sync: editor → preview
  const handleEditorScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const editorMaxScroll = editor.scrollHeight - editor.clientHeight;
    if (editorMaxScroll <= 0) return;

    // Snap to bottom
    if (editor.scrollTop >= editorMaxScroll - 1) {
      isSyncingRef.current = true;
      preview.scrollTop = preview.scrollHeight - preview.clientHeight;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
      return;
    }

    // Snap to top
    if (editor.scrollTop <= 0) {
      isSyncingRef.current = true;
      preview.scrollTop = 0;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
      return;
    }

    const topLine = getEditorTopLine();
    const totalLines = markdown.split("\n").length;
    const lineRatio = (topLine - 1) / Math.max(totalLines - 1, 1);

    // Find elements with data-source-line for interpolation
    const elements =
      preview.querySelectorAll<HTMLElement>("[data-source-line]");
    if (elements.length === 0) {
      // Fallback to ratio-based sync
      isSyncingRef.current = true;
      const ratio = editor.scrollTop / editorMaxScroll;
      preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
      return;
    }

    // Find the two closest elements and interpolate
    let before: HTMLElement | null = null;
    let after: HTMLElement | null = null;
    let beforeLine = 0;
    let afterLine = totalLines;

    for (const el of elements) {
      const line = parseInt(el.dataset.sourceLine || "0", 10);
      if (line <= topLine && line >= beforeLine) {
        before = el;
        beforeLine = line;
      }
      if (line > topLine && (after === null || line < afterLine)) {
        after = el;
        afterLine = line;
      }
    }

    isSyncingRef.current = true;

    const previewScrollArea = preview.scrollHeight - preview.clientHeight;
    if (before && after) {
      const beforeTop = before.offsetTop - preview.offsetTop;
      const afterTop = after.offsetTop - preview.offsetTop;
      const t =
        afterLine === beforeLine
          ? 0
          : (topLine - beforeLine) / (afterLine - beforeLine);
      preview.scrollTop = Math.min(
        beforeTop + t * (afterTop - beforeTop),
        previewScrollArea,
      );
    } else if (before) {
      // After the last element → interpolate with ratio
      const beforeTop = before.offsetTop - preview.offsetTop;
      const t =
        totalLines === beforeLine
          ? 1
          : (topLine - beforeLine) / (totalLines - beforeLine);
      preview.scrollTop = Math.min(
        beforeTop + t * (previewScrollArea - beforeTop),
        previewScrollArea,
      );
    } else {
      preview.scrollTop = lineRatio * previewScrollArea;
    }

    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, [markdown, getEditorTopLine]);

  const handlePreviewScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    isSyncingRef.current = true;
    const ratio =
      preview.scrollTop /
      Math.max(preview.scrollHeight - preview.clientHeight, 1);
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  // Tab key indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue =
        markdown.substring(0, start) + "  " + markdown.substring(end);
      setMarkdown(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !markdown.trim()) return;
    // TODO: Connect to external backend via NEXT_PUBLIC_API_RUST_URL
    console.log("save", { title, thumbnailUrl, content: markdown });
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      {/* Save button */}
      <div className="mx-4 mb-3 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {t("write_save")}
        </button>
      </div>

      {/* Title */}
      <div className="max-w-full mx-4 mb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("write_title_placeholder")}
          className="w-full px-4 py-3 text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent dark:text-white"
        />
      </div>

      {/* Thumbnail URL */}
      <div className="max-w-full mx-4 mb-4">
        <input
          type="text"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder={t("write_thumbnail_placeholder")}
          className="w-full px-4 py-2 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Editor + Preview */}
      <div
        className="flex mx-4 gap-4"
        style={{ height: "calc(100vh - 260px)" }}
      >
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              EDITOR
            </span>
          </div>
          <textarea
            ref={editorRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleEditorScroll}
            placeholder={t("write_editor_placeholder")}
            className="flex-1 w-full p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:text-white"
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300 dark:bg-gray-600" />

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              PREVIEW
            </span>
          </div>
          <div
            ref={previewRef}
            onScroll={handlePreviewScroll}
            className="flex-1 overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          >
            <div className="markdown-body dark:bg-gray-900! dark:text-white!">
              {title && <h1 className="mb-4! pb-2! border-b!">{title}</h1>}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={rehypePlugins}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
