# Blog (Frontend)

This repository now holds only the **frontend** of the blog, built with Next.js (App Router) and MDX.

The previous full-stack infrastructure — AWS EC2, Docker / Docker Compose, Ansible deployment, Caddy reverse proxy, CloudWatch monitoring, and the self-hosted backend & automation pipeline — has been migrated to a separate project:

👉 **[foreverfl/blog-v2](https://github.com/foreverfl/blog-v2)**

What remains here is being simplified into a static, Pages-based frontend.

---

## Tech Stack

- **Framework**: React, Next.js (App Router)
- **Styling**: Tailwind CSS
- **Content**: MDX-based content system
- **i18n**: Multi-language support (EN / KO / JA)

---

## Folder Structure

- **/app**: Next.js app directory (pages, routes)
- **/components**: UI components (atomic design: atom / molecule / organism)
- **/contents**: Markdown/MDX content files (posts, projects, notes)
- **/lib**: Utility functions and helpers
- **/public**: Static assets, images, fonts
- **/styles**: Global styles (Tailwind CSS)
