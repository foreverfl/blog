// 파일 경로 배열
const mdxFilePaths = [
  "ko/development/project/001-how-to-create-a-blog-with-nextjs",
  "ja/development/project/001-how-to-create-a-blog-with-nextjs",
  "ko/development/project/002-making-docs-site",
  "ja/development/project/002-making-docs-site",
];

// SSR용 MDX 파일 import 함수
const importMDXFileSSR = (path: string) => {
  return require(`@/contents/${path}.mdx`).default;
};

// 동적으로 import할 파일을 객체로 저장
const mdxFiles: { [key: string]: any } = {};

mdxFilePaths.forEach((filePath) => {
  mdxFiles[filePath] = importMDXFileSSR(filePath);
});

export default mdxFiles;
