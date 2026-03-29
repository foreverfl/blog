"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import CodeBlock from "@/components/atom/CodeBlock";
import Comment from "@/components/molecules/Comment";
import Good from "@/components/molecules/Good";
import "github-markdown-css";

const RUST_API =
  process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";

interface PostContent {
  lang: string;
  content_type: string;
  title: string | null;
  body_markdown: string | null;
}

interface PostData {
  classification: string;
  category: string;
  slug: string;
  contents: PostContent[];
}

const SlugContent: React.FC = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const lan = segments[0] || "en";
  const classification = segments[1];
  const category = segments[2];
  const slug = segments[3];

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!classification || !category || !slug) return;

    fetch(`${RUST_API}/posts/${classification}/${category}/${slug}?lang=${lan}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setPost(data);
      })
      .catch((err) => {
        console.error("Failed to fetch post:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [classification, category, slug, lan]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full md:w-3/5">
          <div className="my-56" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Post not found</p>
      </div>
    );
  }

  const content = post.contents[0];
  const markdown = content?.body_markdown || "";

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="markdown-body w-full md:w-3/5">
          <div className="my-56" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              code({ className, children, ...props }) {
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
            }}
          >
            {markdown}
          </ReactMarkdown>
          <div className="my-56" />
        </div>
      </div>
      <Good />
      <Comment />
    </>
  );
};

export default SlugContent;
