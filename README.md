# Blog

This blog is built using **React**, **Next.js**, and **MDX**, and deployed on **Vercel**.

## Tech Stack

- **Frontend**: React + Next.js + Tailwind CSS
- **Content**: MDX (Markdown with React components)
- **Deployment**: Vercel
- **Worker API**: Cloudflare Workers (used for content upload and CDN proxy)

## Docker

### Build

```bash
docker build -t blog-dev -f Dockerfile.dev .
```

### Run

```bash
docker run -it -p 3000:3000 --name blog-dev blog-dev
```
