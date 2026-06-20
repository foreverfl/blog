# Blog (Frontend)

This repository now holds only the **frontend** of the blog, built with Astro and React islands.

The previous full-stack infrastructure — AWS EC2, Docker / Docker Compose, Ansible deployment, Caddy reverse proxy, CloudWatch monitoring, and the self-hosted backend & automation pipeline — has been migrated to a separate project:

👉 **[foreverfl/blog-v2](https://github.com/foreverfl/blog-v2)**

What remains here is being migrated from Next.js to a static, Cloudflare Pages-based Astro frontend. The legacy `app/` (Next.js App Router) directory is kept for reference while its API routes are moved over to the backend one by one.

---

## Tech Stack

- **Framework**: Astro (static output) with React islands
- **Styling**: Tailwind CSS (v4, via PostCSS)
- **Content**: Rendered at runtime with `react-markdown`, fetched from the backend
- **i18n**: Multi-language support (EN / KO / JA)

---

## Folder Structure

- **/src**: Astro pages and layouts (file-based routing)
- **/app**: Legacy Next.js app directory (kept for reference during migration)
- **/components**: UI components (atomic design: atom / molecule / organism), used as React islands
- **/lib**: Utility functions and helpers
- **/public**: Static assets, images, fonts
- **/styles**: Global styles (Tailwind CSS)
