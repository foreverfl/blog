// Strip markdown syntax down to plain text for a clean SEO meta description.
// Kept in a .ts module (not an .astro frontmatter) because the backticks in the
// code-fence regex break Astro frontmatter syntax highlighting.
export function buildExcerpt(
  markdown: string | null | undefined,
  maxLength = 160,
): string {
  if (!markdown) return "";
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
    .replace(/[#>*_`~|-]/g, " ") // md symbols
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLength);
}
