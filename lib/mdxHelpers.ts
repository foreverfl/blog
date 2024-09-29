import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

interface FrontMatter {
  fileName?: string;
  title: string;
  date: string;
  classification: string;
  category: string;
  image: string;
}

// 재귀적으로 폴더를 탐색하며 .mdx 파일 찾기
async function getFilesRecursively(dir: string): Promise<string[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries
    .filter((file) => !file.isDirectory() && file.name.endsWith(".mdx"))
    .map((file) => path.join(dir, file.name));
  const folders = entries.filter((folder) => folder.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(dir, folder.name);
    const folderFiles = await getFilesRecursively(folderPath);
    files.push(...folderFiles);
  }

  return files;
}

// 모든 .mdx 파일의 FrontMatter 가져오기
export async function getAllPostFrontMatters(
  lan?: string,
  classification?: string,
  category?: string
): Promise<FrontMatter[]> {
  // 기본 경로 설정
  let contentDirectory = path.join(process.cwd(), `contents/${lan}/`);

  if (classification && category) {
    contentDirectory = path.join(
      process.cwd(),
      `contents/${lan}/${classification}/${category}`
    );
  }

  const filePaths = await getFilesRecursively(contentDirectory);

  const frontMatters: FrontMatter[] = [];

  for (const filePath of filePaths) {
    const fileContents = fs.readFileSync(filePath, "utf8");

    const { frontmatter } = await compileMDX<FrontMatter>({
      source: fileContents,
      options: { parseFrontmatter: true },
    });

    frontMatters.push({
      fileName: path.basename(filePath),
      title: frontmatter.title || "No title",
      date: frontmatter.date || "No date",
      classification: frontmatter.classification || "No classification",
      category: frontmatter.category || "No category",
      image: frontmatter.image || "No image",
    });
  }

  return frontMatters;
}

// 특정 .mdx 파일의 프론트매터를 가져오기
export async function getPostFrontMatter(
  lan: string,
  classification: string,
  category: string,
  slug: string
): Promise<FrontMatter | null> {
  try {
    // 파일 경로 설정
    const filePath = path.join(
      process.cwd(),
      `contents/${lan}/${classification}/${category}/${slug}.mdx`
    );

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    // 파일 읽기
    const fileContents = fs.readFileSync(filePath, "utf8");

    // MDX 파일에서 frontmatter 파싱
    const { frontmatter } = await compileMDX<FrontMatter>({
      source: fileContents,
      options: { parseFrontmatter: true },
    });

    return {
      title: frontmatter.title || "No title",
      date: frontmatter.date || "No date",
      classification: frontmatter.classification || "No classification",
      category: frontmatter.category || "No category",
      image: frontmatter.image || "No image",
    };
  } catch (error) {
    console.error("Error reading file or parsing MDX:", error);
    return null;
  }
}

// 특정 .mdx 파일의 내용을 가져오기
export function getMdxFileContent(
  lan: string,
  classification: string,
  category: string,
  slug: string
) {
  const filePath = path.join(
    process.cwd(),
    `contents/${lan}/${classification}/${category}/${slug}.mdx`
  );

  const fileContent = fs.readFileSync(filePath, "utf8");
  return fileContent;
}

// MDX 컴파일 함수
export async function compileMdxContent(fileContent: string) {
  return await compileMDX({
    source: fileContent,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: "github-light",
            },
          ],
        ],
      },
    },
  });
}
