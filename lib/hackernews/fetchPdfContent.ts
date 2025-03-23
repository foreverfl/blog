import { getDocument } from "pdfjs-dist";
import fs from "fs/promises";
import path from "path";
import os from "os";

/**
 * pdfjs-dist
 */
async function parsePdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
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
  const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}.pdf`);

  try {
    // PDF를 node-fetch를 통해 다운로드
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

export async function fetchPdfContentLocal(filePath: string): Promise<string | null> {
  try {
    const buffer = await fs.readFile(filePath);
    console.log(`✅ PDF loaded from ${filePath}`);

    const arrayBuffer: ArrayBuffer = (buffer.buffer as ArrayBuffer).slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );

    const text = await parsePdfBuffer(arrayBuffer);
    console.log("✅ PDF parsing completed");

    return text;
  } catch (err) {
    console.error("❌ Error during PDF fetch/parse:", err);
    return null;
  }
}