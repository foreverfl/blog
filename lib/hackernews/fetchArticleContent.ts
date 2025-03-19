import axios from "axios";
import { JSDOM } from "jsdom";

export async function fetchArticleContent(url: string) {
  try {
    const res = await axios.get(url);
    const dom = new JSDOM(res.data);
    const articleElement = dom.window.document.querySelector("article");

    if (!articleElement) {
      console.log("article 태그를 찾지 못했습니다.");
      return null;
    }

    return articleElement.textContent?.trim() || "";
  } catch (error) {
    console.error("크롤링 중 오류:", error);
    return null;
  }
}
