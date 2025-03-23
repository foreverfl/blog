import { chromium } from "playwright";

function cleanText(text: string) {
  return text
    .replace(/[\u200B\u00A0]/g, "") // zero-width space, non-breaking space 제거
    .replace(/[ \t]+(\n)/g, "$1") // 개행 앞뒤 공백 제거
    .replace(/\n{2,}/g, "\n\n") // 연속 개행은 2개로 축소
    .trim();
}

export async function fetchContent(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const rawContent = await page.evaluate(() => {
    // <article>
    const article = document.querySelector("article");
    if (article) return article.textContent || "";

    // <div class="content">
    const diClasscontent = document.querySelector("div.content");
    if (diClasscontent) return diClasscontent.textContent || "";

    // <div id="content">
    const divIdContent = document.querySelector("div#content");
    if (divIdContent) return divIdContent.textContent || "";

    // <div class="main">
    const divClassMain = document.querySelector("div.main");
    if (divClassMain) return divClassMain.textContent || "";
    
    // <div class="entry">
    const divClassEntry = document.querySelector("div.entry");
    if (divClassEntry) return divClassEntry.textContent || "";

    // <div class="content-area">
    const divClassContentArea = document.querySelector("div.content-area");
    if (divClassContentArea) return divClassContentArea.textContent || "";

    // <div class="bodycopy">
    const divClassBodycopy = document.querySelector("div.bodycopy");
    if (divClassBodycopy) return divClassBodycopy.textContent || "";

    // <div class="node__content">
    const divClassNodeContent = document.querySelector("div.node__content");
    if (divClassNodeContent) return divClassNodeContent.textContent || "";

    // <section>
    const sections = document.querySelectorAll("section");
    if (sections.length > 0) {
      return Array.from(sections)
        .map((sec) => sec.textContent?.trim() || "")
        .join("\n\n");
    }

    return null;
  });

  await browser.close();
  return rawContent ? cleanText(rawContent) : null;
}
