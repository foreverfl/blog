// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// Static output for Cloudflare Pages; React used only for islands.
// Tailwind v4 is wired via PostCSS (postcss.config.mjs), not the Vite plugin,
// because @tailwindcss/vite is incompatible with Astro 6's rolldown-vite.
export default defineConfig({
  site: "https://mogumogu.dev",
  output: "static",
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes("/auth/") && !page.includes("/assets"),
    }),
  ],
});
