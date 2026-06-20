// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Static output for Cloudflare Pages; React used only for islands.
// Tailwind v4 is wired via PostCSS (postcss.config.mjs), not the Vite plugin,
// because @tailwindcss/vite is incompatible with Astro 6's rolldown-vite.
export default defineConfig({
  output: "static",
  integrations: [react()],
});
