import { summarize } from "@/lib/openai/summarize";
import fs from "fs/promises";

(async () => {
  const filePath = "./test-data/greengreen.txt";
  const sampleText = await fs.readFile(filePath, "utf-8");
  console.log("filePath:", filePath);

  try {
    const summary = await summarize(sampleText);
    console.log("Summary:", summary);
  } catch (error) {
    console.error("Error during summarization:", error);
  }
})();
