import { chromium } from "playwright";

function cleanText(text: string) {
  return text
    .replace(/[\u200B\u00A0]/g, "") // zero-width space, non-breaking space 제거
    .replace(/[ \t]+(\n)/g, "$1") // 개행 앞 공백 제거
    .replace(/\n{2,}/g, "\n\n") // 연속 개행 2개로 축소
    .trim();
}

export async function fetchEconomistContent(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const content = await page.evaluate(() => {
    const paragraphs = document.querySelectorAll(
      'p[data-component="paragraph"]',
    );
    return Array.from(paragraphs)
      .map((p) => p.textContent?.trim() || "")
      .join("\n\n");
  });

  await browser.close();

  return content ? cleanText(content) : null;
}
