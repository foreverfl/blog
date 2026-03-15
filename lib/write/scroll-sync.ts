interface ScrollSyncRefs {
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  isSyncingRef: React.RefObject<boolean>;
}

export function getEditorTopLine(editor: HTMLTextAreaElement): number {
  const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
  return Math.floor(editor.scrollTop / lineHeight) + 1;
}

// Editor → Preview scroll sync using line-based interpolation
export function syncEditorToPreview(refs: ScrollSyncRefs, markdown: string) {
  if (refs.isSyncingRef.current) return;
  const editor = refs.editorRef.current;
  const preview = refs.previewRef.current;
  if (!editor || !preview) return;

  const editorMaxScroll = editor.scrollHeight - editor.clientHeight;
  if (editorMaxScroll <= 0) return;

  // Snap to bottom
  if (editor.scrollTop >= editorMaxScroll - 1) {
    refs.isSyncingRef.current = true;
    preview.scrollTop = preview.scrollHeight - preview.clientHeight;
    requestAnimationFrame(() => {
      refs.isSyncingRef.current = false;
    });
    return;
  }

  // Snap to top
  if (editor.scrollTop <= 0) {
    refs.isSyncingRef.current = true;
    preview.scrollTop = 0;
    requestAnimationFrame(() => {
      refs.isSyncingRef.current = false;
    });
    return;
  }

  const topLine = getEditorTopLine(editor);
  const totalLines = markdown.split("\n").length;
  const lineRatio = (topLine - 1) / Math.max(totalLines - 1, 1);

  const elements = preview.querySelectorAll<HTMLElement>("[data-source-line]");
  if (elements.length === 0) {
    // Fallback to ratio-based sync
    refs.isSyncingRef.current = true;
    const ratio = editor.scrollTop / editorMaxScroll;
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    requestAnimationFrame(() => {
      refs.isSyncingRef.current = false;
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

  refs.isSyncingRef.current = true;

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
    refs.isSyncingRef.current = false;
  });
}

// Preview → Editor scroll sync (ratio-based)
export function syncPreviewToEditor(refs: ScrollSyncRefs) {
  if (refs.isSyncingRef.current) return;
  const editor = refs.editorRef.current;
  const preview = refs.previewRef.current;
  if (!editor || !preview) return;

  refs.isSyncingRef.current = true;
  const ratio =
    preview.scrollTop /
    Math.max(preview.scrollHeight - preview.clientHeight, 1);
  editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
  requestAnimationFrame(() => {
    refs.isSyncingRef.current = false;
  });
}
