const RUST_API = import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002";

interface UploadContext {
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  markdown: string;
  setMarkdown: React.Dispatch<React.SetStateAction<string>>;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  onAuthError: () => void;
}

export async function uploadImages(files: File[], ctx: UploadContext) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    ctx.onAuthError();
    return;
  }

  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length === 0) return;

  const editor = ctx.editorRef.current;
  if (!editor) return;

  ctx.setUploading(true);

  // Build all placeholders and insert them at once at cursor position
  const placeholders = imageFiles.map(
    (file) => `![Uploading ${file.name}...]()`,
  );
  const placeholderBlock = placeholders.join("\n");

  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const before = ctx.markdown.substring(0, start);
  const after = ctx.markdown.substring(end);

  // Add newlines around the block if needed
  const needNewlineBefore = before.length > 0 && !before.endsWith("\n");
  const needNewlineAfter = after.length > 0 && !after.startsWith("\n");
  const insertText =
    (needNewlineBefore ? "\n" : "") +
    placeholderBlock +
    (needNewlineAfter ? "\n" : "");

  ctx.setMarkdown(before + insertText + after);

  // Upload all files in parallel, replacing each placeholder as it completes
  const uploads = imageFiles.map(async (file, i) => {
    const placeholder = placeholders[i];
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${RUST_API}/assets`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errBody}`);
      }

      const assets = await res.json();
      const asset = assets[0];

      ctx.setMarkdown((prev) =>
        prev.replace(placeholder, `![${file.name}](${asset.url})`),
      );
    } catch (err) {
      console.error("Image upload failed:", err);
      ctx.setMarkdown((prev) => prev.replace(placeholder, ""));
      alert(`Failed to upload ${file.name}: ${err}`);
    }
  });

  await Promise.all(uploads);
  ctx.setUploading(false);
}
