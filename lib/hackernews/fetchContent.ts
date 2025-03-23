import { chromium } from "playwright";

function logError(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ERROR: ${message}\n`;
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
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
  });
  await page.goto(url, { waitUntil: "networkidle" });

  try {
    const rawContent = await page.evaluate(() => {
      // <article>
      const article = document.querySelector("article");
      if (article) return article.textContent || "";

      // <div id="content">
      const divIdContent = document.querySelector("div#content");
      if (divIdContent) return divIdContent.textContent || "";

      // <div class="content">
      const divClasscontent = document.querySelector("div.content");
      if (divClasscontent) return divClasscontent.textContent || "";

      // <div id="post-content">
      const divIdPostContent = document.querySelector("div#post-content");
      if (divIdPostContent) return divIdPostContent.textContent || "";

      // <div class="content-area">
      const divClassContentArea = document.querySelector("div.content-area");
      if (divClassContentArea) return divClassContentArea.textContent || "";

      // <div id="main">
      const divIdMain = document.querySelector("div#main");
      if (divIdMain) return divIdMain.textContent || "";

      // <div class="main">
      const divClassMain = document.querySelector("div.main");
      if (divClassMain) return divClassMain.textContent || "";

      // <div class="prose">
      const divClassProse = document.querySelector("div.prose");
      if (divClassProse) return divClassProse.textContent || "";

      // <div class="entry">
      const divClassEntry = document.querySelector("div.entry");
      if (divClassEntry) return divClassEntry.textContent || "";

      // <div class="bodycopy">
      const divClassBodycopy = document.querySelector("div.bodycopy");
      if (divClassBodycopy) return divClassBodycopy.textContent || "";

      // <div class="node__content">
      const divClassNodeContent = document.querySelector("div.node__content");
      if (divClassNodeContent) return divClassNodeContent.textContent || "";

      // <div class="essay__content">
      const divClassEssayContent = document.querySelector("div.essay__content");
      if (divClassEssayContent) return divClassEssayContent.textContent || "";

      // <section>
      const sections = document.querySelectorAll("section");
      if (sections.length > 0) {
        return Array.from(sections)
          .map((sec) => sec.textContent?.trim() || "")
          .join("\n\n");
      }

      // <main>
      const main = document.querySelector("main");
      if (main) return main.textContent || "";

      return null;
    });

    await browser.close();
    return rawContent ? cleanText(rawContent) : null;
  } catch (error) {
    await browser.close();
    const errorMessage = `Failed to fetch content from ${url}: ${(error as Error).message}`;
    console.error(errorMessage);
    logError(errorMessage);
    throw error;
  }
}
