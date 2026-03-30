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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "@/lib/i18n";
import "github-markdown-css";
import categoryData from "@/public/category.json";

import rehypeRaw from "rehype-raw";
import rehypeSourceLine from "@/lib/write/rehype-source-line";
import CodeBlock from "@/components/atom/CodeBlock";
import slugify from "@/lib/write/slugify";
import { uploadImages } from "@/lib/write/upload-images";
import {
  syncEditorToPreview,
  syncPreviewToEditor,
} from "@/lib/write/scroll-sync";
import { useLoadingDispatch } from "@/lib/context/loading-context";
import { saveDraft, loadDraft, clearDraft } from "@/lib/write/draft-store";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

const LANGS = ["en", "ja", "ko"] as const;
type Lang = (typeof LANGS)[number];

interface LangContent {
  title: string;
  markdown: string;
}

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
  pre: ({ children }) => {
    return <>{children}</>;
  },
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      return (
        <CodeBlock language={match[1]}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default function WritePage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lan = pathname.split("/")[1];
  const { t, i18n } = useTranslation();
  const loadingDispatch = useLoadingDispatch();

  // Edit mode detection
  const editClassification = searchParams.get("classification");
  const editCategory = searchParams.get("category");
  const editSlug = searchParams.get("slug");
  const isEditMode = !!(editClassification && editCategory && editSlug);

  useEffect(() => {
    i18n.changeLanguage(lan);
  }, [lan, i18n]);

  // Language selector state
  const [activeLang, setActiveLang] = useState<Lang>("en");

  // Per-language content
  const [langContents, setLangContents] = useState<Record<Lang, LangContent>>({
    en: { title: "", markdown: "" },
    ja: { title: "", markdown: "" },
    ko: { title: "", markdown: "" },
  });

  // Post metadata
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [classification, setClassification] = useState("");
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Editor state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore draft on mount (new post only)
  useEffect(() => {
    if (isEditMode) return;
    loadDraft().then((draft) => {
      if (!draft) return;
      const age = Date.now() - draft.updatedAt;
      if (age > 7 * 24 * 60 * 60 * 1000) {
        clearDraft();
        return;
      }
      setLangContents(draft.langContents as Record<Lang, LangContent>);
      setActiveLang(draft.activeLang as Lang);
      setClassification(draft.classification);
      setCategory(draft.category);
      setSlug(draft.slug);
      setThumbnailUrl(draft.thumbnailUrl);
      if (draft.slug) setSlugManuallyEdited(true);
    });
  }, []);

  // Auto-save draft every 3 seconds after changes (new post only)
  useEffect(() => {
    if (isEditMode) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      const hasContent = Object.values(langContents).some(
        (c) => c.title.trim() || c.markdown.trim(),
      );
      if (hasContent) {
        saveDraft({
          langContents,
          activeLang,
          classification,
          category,
          slug,
          thumbnailUrl,
          updatedAt: Date.now(),
        });
      }
    }, 3000);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [
    langContents,
    activeLang,
    classification,
    category,
    slug,
    thumbnailUrl,
    isEditMode,
  ]);

  const rehypePlugins = useMemo(
    () => [rehypeRaw, rehypeSlug, rehypeSourceLine],
    [],
  );

  // Current language content helpers
  const currentContent = langContents[activeLang];
  const title = currentContent.title;
  const markdown = currentContent.markdown;

  const setTitle = (val: string) => {
    setLangContents((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], title: val },
    }));
  };

  const setMarkdown: React.Dispatch<React.SetStateAction<string>> = (val) => {
    setLangContents((prev) => {
      const current = prev[activeLang].markdown;
      const newVal = typeof val === "function" ? val(current) : val;
      return {
        ...prev,
        [activeLang]: { ...prev[activeLang], markdown: newVal },
      };
    });
  };

  // Fetch existing post in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const token = localStorage.getItem("access_token");
    fetch(
      `${RUST_API}/posts/${editClassification}/${editCategory}/${editSlug}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();

        setClassification(data.classification);
        setCategory(data.category);
        setSlug(data.slug);
        setSlugManuallyEdited(true);
        if (data.image) setThumbnailUrl(data.image);

        // Fill per-language contents
        const newContents = { ...langContents };
        for (const content of data.contents) {
          const lang = content.lang as Lang;
          if (LANGS.includes(lang)) {
            newContents[lang] = {
              title: content.title || "",
              markdown: content.body_markdown || "",
            };
          }
        }
        setLangContents(newContents);
      })
      .catch((err) => {
        console.error("Failed to load post for editing:", err);
        alert("Failed to load post");
      })
      .finally(() => setLoadingPost(false));
  }, [isEditMode, editClassification, editCategory, editSlug]);

  // Derive category options from selected classification
  const selectedClassification = categoryData.find(
    (c) => c.link === classification,
  );
  const categoryOptions = selectedClassification?.categories || [];

  useEffect(() => {
    if (!isEditMode) setCategory("");
  }, [classification, isEditMode]);

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

  // Translate
  const handleTranslate = async () => {
    const current = langContents[activeLang];
    if (!current.markdown.trim()) {
      alert("No content to translate");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert(t("write_login_required"));
      return;
    }

    setTranslating(true);
    loadingDispatch({ type: "START_LOADING" });
    try {
      const res = await fetch(
        `${RUST_API}/posts/translate?origin=${activeLang}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: current.title,
            content: current.markdown,
          }),
        },
      );

      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();

      setLangContents((prev) => {
        const updated = { ...prev };
        for (const lang of LANGS) {
          if (lang !== activeLang) {
            updated[lang] = {
              title: data[lang]?.title || prev[lang].title,
              markdown: data[lang]?.content || prev[lang].markdown,
            };
          }
        }
        return updated;
      });
    } catch (err: any) {
      console.error("Translation error:", err);
      alert(err.message || "Translation failed");
    } finally {
      setTranslating(false);
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

  // Save post
  const handleSave = async () => {
    if (
      !langContents[activeLang].title.trim() ||
      !langContents[activeLang].markdown.trim()
    )
      return;
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
      // Build contents array from all languages that have content
      const contents = LANGS.filter(
        (lang) =>
          langContents[lang].title.trim() || langContents[lang].markdown.trim(),
      ).map((lang) => ({
        lang,
        content_type: "text/markdown",
        title: langContents[lang].title,
        body_markdown: langContents[lang].markdown,
      }));

      if (isEditMode) {
        // PUT update
        const res = await fetch(
          `${RUST_API}/posts/${editClassification}/${editCategory}/${editSlug}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              classification,
              category,
              slug,
              image: thumbnailUrl || null,
              contents,
            }),
          },
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Update failed: ${res.status}`);
        }

        await clearDraft();
        alert(t("write_save_success"));
        router.push(`/${lan}/${classification}/${category}/${slug}`);
      } else {
        // POST create
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
            contents,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Save failed: ${res.status}`);
        }

        await clearDraft();
        alert(t("write_save_success"));
        router.push(`/${lan}`);
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.message || t("write_save_fail"));
    } finally {
      setSaving(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!isEditMode) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert(t("write_login_required"));
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(
        `${RUST_API}/posts/${editClassification}/${editCategory}/${editSlug}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }

      alert("Post deleted");
      router.push(`/${lan}`);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <span className="text-gray-400 animate-pulse">Loading post...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      {/* Top bar: Language selector + Translate | Delete + Save */}
      <div className="mx-4 mb-3 flex items-center justify-between">
        {/* Left: Language selector + Translate */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            {LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeLang === lang
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                }`}
              >
                {lang === "en" ? "EN" : lang === "ja" ? "JA" : "KO"}
              </button>
            ))}
          </div>
          <button
            onClick={handleTranslate}
            disabled={translating}
            className="px-4 py-2.5 text-sm font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {translating ? "Translating..." : "Translate"}
          </button>
        </div>

        {/* Right: Delete + Save */}
        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? t("write_saving")
              : isEditMode
                ? "Update"
                : t("write_save")}
          </button>
        </div>
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
            {translating && (
              <span className="text-xs text-purple-500 animate-pulse">
                Translating...
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
