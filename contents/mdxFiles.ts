// 언어 배열
const languages = ["ko", "ja"];

// 공통 파일 경로 배열
export const filePaths = [
  // development/project
  "development/project/001-how-to-create-a-blog-with-nextjs",
  "development/project/002-making-docs-site",

  // development/debugging
  "development/debugging/001-nextjs-minified-react-error",

  // career/interviews

  // career/coding-tests

  // documentation/open-source

  // documentatin/translation-notes
  "documentation/translation-notes/001-next-mdx-remote",

  // miscellaneous/my-thoughts
];

// 파일 경로 배열을 동적으로 생성
const mdxFilePaths: string[] = [];

languages.forEach((lang) => {
  filePaths.forEach((path) => {
    mdxFilePaths.push(`${lang}/${path}`);
  });
});

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
