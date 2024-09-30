// 파일 경로 배열
const mdxFilePaths = [
  // development/project
  "ko/development/project/001-how-to-create-a-blog-with-nextjs",
  "ja/development/project/001-how-to-create-a-blog-with-nextjs",
  "ko/development/project/002-making-docs-site",
  "ja/development/project/002-making-docs-site",

  // development/debugging
  "ko/development/debugging/001-nextjs-minified-react-error",
  "ja/development/debugging/001-nextjs-minified-react-error",

  // career/interviews
  "ko/career/interviews/001-dummy",
  "ja/career/interviews/001-dummy",

  // career/coding-tests
  "ko/career/coding-tests/001-dummy",
  "ja/career/coding-tests/001-dummy",

  // documentation/open-source
  "ko/documentation/open-source/001-dummy",
  "ja/documentation/open-source/001-dummy",

  // documentatin/translation-notes
  "ko/documentation/translation-notes/001-dummy",
  "ja/documentation/translation-notes/001-dummy",

  // miscellaneous/my-thoughts
  "ko/miscellaneous/my-thoughts/001-dummy",
  "ja/miscellaneous/my-thoughts/001-dummy",
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
