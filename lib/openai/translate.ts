import dotenv from "dotenv";
import fs from "fs";
import { OpenAI } from "openai";
import path from "path";

dotenv.config({ path: "./.env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translate(
  text: string,
  lan: "ja" | "ko",
  mode: "title" | "content" = "content" 
): Promise<string> {
  try {
    // Conclude the prompt file name based on the mode
    const promptFileName = mode === "title"
    ? `translate-title-${lan}.md`
    : `translate-${lan}.md`;

    const promptPath = path.resolve(
      new URL(import.meta.url).pathname,
      `../../prompts/${promptFileName}`
    );
    console.log("Prompt file path:", promptPath);

    const prompt = fs.readFileSync(promptPath, "utf-8");
    console.log("Prompt file content loaded successfully");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful translator." },
        { role: "user", content: `${prompt}\n\n${text}` },
      ],
      max_tokens: 15000,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Failed to get translated content");
    }
    const translated = content;
    console.log("mode:", mode);
    console.log("Translated text:", translated);
    return translated;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate the text");
  }
}
