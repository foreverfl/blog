import { chromium } from "playwright";

export async function fetchArxivAbstract(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const abstract = await page.evaluate(() => {
    const blockquote = document.querySelector("blockquote.abstract");
    if (blockquote) {
      return blockquote.textContent
        ?.replace("Abstract:", "")
        .trim()
        .replace(/\s+/g, " ");
    }
    return null;
  });

  await browser.close();
  return abstract;
}
