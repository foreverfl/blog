import dotenv from "dotenv";
import fs from "fs";
import { OpenAI } from "openai";
import path from "path";
import { getDailyFilePath, readJsonFile } from "../hackernews/fileUtils";

dotenv.config({ path: "./.env.local" });

export async function keywords(date: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const today = new Date();
  today.setHours(today.getHours() + 9);
  const defaultDate = today.toISOString().slice(2, 10).replace(/-/g, "");
  const dateString = date ?? defaultDate;

  try {
    const stylePath = path.resolve(
      new URL(import.meta.url).pathname,
      "../../prompts/keywords.md"
    );
    console.log("Style file path:", stylePath);
    const keywordsPrompt = fs.readFileSync(stylePath, "utf-8");

    const filePath = await getDailyFilePath(
      "contents/trends/hackernews",
      dateString
    );
    const items = await readJsonFile(filePath);

    const topItem = items
      .filter((item: any) => {
        const en = item.summary?.en;
        return typeof en === "string" && en.trim().length > 0;
      })
      .sort((a: any, b: any) => b.score - a.score)[0];

    const summary = topItem?.summary?.en || "No valid item found";

    const combinedPrompt = `${keywordsPrompt}\n\nSummary:\n${summary}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts keywords for generating an image.",
        },
        { role: "user", content: combinedPrompt },
      ],
    });

    const keywords =
      response.choices[0].message?.content?.trim() || "No keywords found";
    return keywords;
  } catch (error) {
    console.error("❌ Error extracting keywords:", error);
    throw new Error("Failed to extract keywords");
  }
}
