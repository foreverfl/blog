import fs from "fs/promises";
import { sliceTextByTokens } from "../lib/text";

(async () => {
  try {
    const filePath = "./test-data/naruto.txt"; // 파일 경로 설정
    const text = await fs.readFile(filePath, "utf-8"); 
    console.log("text:", text.slice(0, 1000)); // 파일 내용 확인

    const slicedText = await sliceTextByTokens(text, 15000);
    // console.log("Sliced Text:", slicedText);
  } catch (err) {
    console.error("❌ Error reading file:", err);
  }
})();
