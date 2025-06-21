import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs/promises";
import path from "path";
import os from "os";

GlobalWorkerOptions.workerSrc = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/build/pdf.worker.mjs",
);

async function checkWorkerPath() {
  try {
    await fs.access(GlobalWorkerOptions.workerSrc);
    console.log("📄 pdf.worker.mjs 파일이 존재합니다!");
  } catch (err) {
    console.error("❌ pdf.worker.mjs 파일을 찾을 수 없습니다:", err);
  }
}

/**
 * pdfjs-dist
 */
async function parsePdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let fullText = "";

  const totalPages = Math.min(pdf.numPages, 10);

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n\n";
  }

  return fullText
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchPdfContent(url: string): Promise<string | null> {
  checkWorkerPath();
  const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}.pdf`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from ${url}`);
    }
    const buffer = await response.arrayBuffer();

    await fs.writeFile(tempFilePath, Buffer.from(buffer));
    console.log(`✅ PDF saved to ${tempFilePath}`);

    const text = await parsePdfBuffer(buffer);
    console.log("✅ PDF parsing completed");

    return text;
  } catch (err) {
    console.error("❌ Error during PDF fetch/parse:", err);
    return null;
  }
}

export async function fetchPdfContentLocal(
  filePath: string,
): Promise<string | null> {
  try {
    const buffer = await fs.readFile(filePath);
    console.log(`✅ PDF loaded from ${filePath}`);

    const arrayBuffer: ArrayBuffer = (buffer.buffer as ArrayBuffer).slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );

    const text = await parsePdfBuffer(arrayBuffer);
    console.log("✅ PDF parsing completed");

    return text;
  } catch (err) {
    console.error("❌ Error during PDF fetch/parse:", err);
    return null;
  }
}
