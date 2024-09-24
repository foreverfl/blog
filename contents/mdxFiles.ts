const mdxFiles: { [key: string]: React.ComponentType<any> } = {
  // development/project
  "ko/development/project/001-how-to-create-a-blog-with-nextjs":
    require("@/contents/ko/development/project/001-how-to-create-a-blog-with-nextjs.mdx")
      .default,
  "ja/development/project/001-how-to-create-a-blog-with-nextjs":
    require("@/contents/ja/development/project/001-how-to-create-a-blog-with-nextjs.mdx")
      .default,
};

export default mdxFiles;
