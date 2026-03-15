"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import "@/lib/i18n";
import "github-markdown-css";
import categoryData from "@/public/category.json";

import rehypeSourceLine from "@/lib/write/rehype-source-line";
import slugify from "@/lib/write/slugify";
import { uploadImages } from "@/lib/write/upload-images";
import {
  syncEditorToPreview,
  syncPreviewToEditor,
} from "@/lib/write/scroll-sync";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

// Skip rendering images with empty src to avoid browser warnings
const markdownComponents: Components = {
  img: ({ src, alt, ...props }) => {
    if (!src) return null;
    return (
      <img
        src={src}
        alt={alt || ""}
        {...props}
        style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
      />
    );
  },
};

export default function WritePage() {
  const pathname = usePathname();
  const router = useRouter();
  const lan = pathname.split("/")[1];
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(lan);
  }, [lan, i18n]);

  // Post metadata
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [classification, setClassification] = useState("");
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Editor state
  const [markdown, setMarkdown] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const rehypePlugins = useMemo(() => [rehypeSlug, rehypeSourceLine], []);

  // Derive category options from selected classification
  const selectedClassification = categoryData.find(
    (c) => c.link === classification,
  );
  const categoryOptions = selectedClassification?.categories || [];

  useEffect(() => {
    setCategory("");
  }, [classification]);

  useEffect(() => {
    if (!slugManuallyEdited) setSlug(slugify(title));
  }, [title, slugManuallyEdited]);

  const getLocalizedName = (item: {
    name_en: string;
    name_ko: string;
    name_ja: string;
  }) => {
    if (lan === "ko") return item.name_ko;
    if (lan === "ja") return item.name_ja;
    return item.name_en;
  };

  // Scroll sync refs bundle
  const scrollRefs = useMemo(
    () => ({ editorRef, previewRef, isSyncingRef }),
    [],
  );

  const handleEditorScroll = useCallback(() => {
    syncEditorToPreview(scrollRefs, markdown);
  }, [scrollRefs, markdown]);

  const handlePreviewScroll = useCallback(() => {
    syncPreviewToEditor(scrollRefs);
  }, [scrollRefs]);

  // Image upload
  const handleUpload = useCallback(
    (files: File[]) => {
      uploadImages(files, {
        editorRef,
        markdown,
        setMarkdown,
        setUploading,
        onAuthError: () => alert(t("write_login_required")),
      });
    },
    [markdown, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      handleUpload(Array.from(e.dataTransfer.files));
    },
    [handleUpload],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => e.preventDefault(),
    [],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const imageFiles: File[] = [];
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        handleUpload(imageFiles);
      }
    },
    [handleUpload],
  );

  // Tab key indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      setMarkdown(
        markdown.substring(0, start) + "  " + markdown.substring(end),
      );
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  // Save post
  const handleSave = async () => {
    if (!title.trim() || !markdown.trim()) return;
    if (!classification || !category || !slug.trim()) {
      alert(t("write_missing_fields"));
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert(t("write_login_required"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${RUST_API}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classification,
          category,
          slug,
          body: thumbnailUrl || null,
          contents: [
            {
              lang: lan,
              content_type: "text/markdown",
              title,
              body_markdown: markdown,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Save failed: ${res.status}`);
      }

      alert(t("write_save_success"));
      router.push(`/${lan}`);
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.message || t("write_save_fail"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      {/* Save button */}
      <div className="mx-4 mb-3 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t("write_saving") : t("write_save")}
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
      <div className="max-w-full mx-4 mb-2">
        <input
          type="text"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder={t("write_thumbnail_placeholder")}
          className="w-full px-4 py-2 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Classification / Category / Slug */}
      <div className="max-w-full mx-4 mb-4 flex gap-4">
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          className="flex-1 px-4 py-2 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-700 dark:text-gray-300 dark:bg-transparent"
        >
          <option value="">{t("write_classification_placeholder")}</option>
          {categoryData.map((c) => (
            <option key={c.link} value={c.link}>
              {c.emoji} {getLocalizedName(c)}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!classification}
          className="flex-1 px-4 py-2 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-700 dark:text-gray-300 dark:bg-transparent disabled:opacity-40"
        >
          <option value="">{t("write_category_placeholder")}</option>
          {categoryOptions.map((c) => (
            <option key={c.link} value={c.link}>
              {c.emoji} {getLocalizedName(c)}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugManuallyEdited(true);
          }}
          placeholder={t("write_slug_placeholder")}
          className="flex-1 px-4 py-2 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Editor + Preview */}
      <div
        className="flex mx-4 gap-4"
        style={{ height: "calc(100vh - 310px)" }}
      >
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              EDITOR
            </span>
            {uploading && (
              <span className="text-xs text-blue-500 animate-pulse">
                {t("write_uploading")}
              </span>
            )}
          </div>
          <textarea
            ref={editorRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleEditorScroll}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onPaste={handlePaste}
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
                components={markdownComponents}
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
