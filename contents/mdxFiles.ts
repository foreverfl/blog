import dynamic from "next/dynamic";

const mdxFiles: { [key: string]: any } = {
  // development/project
  "ko/development/project/001-how-to-create-a-blog-with-nextjs": dynamic(
    () =>
      import(
        "@/contents/ko/development/project/001-how-to-create-a-blog-with-nextjs.mdx"
      )
  ),
  "ja/development/project/001-how-to-create-a-blog-with-nextjs": dynamic(
    () =>
      import(
        "@/contents/ja/development/project/001-how-to-create-a-blog-with-nextjs.mdx"
      )
  ),
  "ko/development/project/002-making-docs-site": dynamic(
    () => import("@/contents/ko/development/project/002-making-docs-site.mdx")
  ),
  "ja/development/project/002-making-docs-site": dynamic(
    () => import("@/contents/ja/development/project/002-making-docs-site.mdx")
  ),
};

export default mdxFiles;
