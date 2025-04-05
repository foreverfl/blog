import { chromium } from "playwright";

function logError(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ERROR: ${message}\n`;
  console.error(logMessage);
}

function cleanText(text: string) {
  return text
    .replace(/[\u200B\u00A0]/g, "") // zero-width space, non-breaking space 제거
    .replace(/[ \t]+(\n)/g, "$1") // 개행 앞뒤 공백 제거
    .replace(/\n{2,}/g, "\n\n") // 연속 개행은 2개로 축소
    .trim();
}

export async function fetchContent(url: string) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });

    const content = await page.evaluate(() => {
      // Arxiv
      const arxiv = document.querySelector("blockquote.abstract");
      if (arxiv) {
        return arxiv.textContent?.replace("Abstract:", "").trim();
      }

      // Economist
      const economistParagraphs = document.querySelectorAll(
        'p[data-component="paragraph"]'
      );
      if (economistParagraphs.length > 0) {
        return Array.from(economistParagraphs)
          .map((p) => p.textContent?.trim() || "")
          .join("\n\n");
      }

      // General case
      const selectors = [
        "article",
        "div#content",
        "div.content",
        "div#post-content",
        "div.content-area",
        "div#main",
        "div.main",
        "div.prose",
        "div.entry",
        "div.bodycopy",
        "div.node__content",
        "div.essay__content",
        "main",
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el.textContent || "";
      }

      // <section> fallback
      const sections = document.querySelectorAll("section");
      if (sections.length > 0) {
        return Array.from(sections)
          .map((sec) => sec.textContent?.trim() || "")
          .join("\n\n");
      }

      return null;
    });

    await browser.close();
    return content ? cleanText(content) : null;

  } catch (error) {
    
    await browser.close();
    const errorMessage = `Failed to fetch content from ${url}: ${
      (error as Error).message
    }`;
    console.error(errorMessage);
    logError(errorMessage);
    throw error;
  }
}
