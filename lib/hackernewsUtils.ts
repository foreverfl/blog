import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import pdfParse from "pdf-parse";

export async function fetchContentFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    console.log("contentType: ", contentType);

    if (!contentType) return null;

    // github
    if (contentType.includes("text/html")) {
      const html = await response.text();
      const dom = new JSDOM(html);
      const articleText =
        dom.window.document.querySelector("article")?.textContent;
      if (articleText) return articleText.slice(0, 10000);
    }
    // else if (contentType.includes("application/pdf")) {
    //   const buffer = await response.arrayBuffer();
    //   const text = await pdfParse(Buffer.from(buffer));
    //   return text.text.slice(0, 2000);
    // } else {
    //   return null;
    // }

    return "No content found";
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
}
