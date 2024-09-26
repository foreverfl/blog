const mdxFiles: { [key: string]: React.ComponentType<any> } = {
  // development/project
  "ko/development/project/001-how-to-create-a-blog-with-nextjs":
    require("@/contents/ko/development/project/001-how-to-create-a-blog-with-nextjs.mdx")
      .default,
  "ja/development/project/001-how-to-create-a-blog-with-nextjs":
    require("@/contents/ja/development/project/001-how-to-create-a-blog-with-nextjs.mdx")
      .default,
  "ko/development/project/002-making-docs-site":
    require("@/contents/ko/development/project/002-making-docs-site.mdx")
      .default,
  "ja/development/project/002-making-docs-site":
    require("@/contents/ja/development/project/002-making-docs-site.mdx")
      .default,
};

export default mdxFiles;
