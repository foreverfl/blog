import dotenv from "dotenv";
import fs from "fs";
import { OpenAI } from "openai";
import path from "path";

dotenv.config({ path: "./.env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarize(text: string): Promise<string> {
  try {
    // 현재 파일 경로를 기반으로 prompt 파일의 경로 계산
    const promptPath = path.resolve(new URL(import.meta.url).pathname, "../../prompts/summary.md");
    console.log("Prompt file path:", promptPath);

    // 프롬프트 파일 읽기
    const prompt = fs.readFileSync(promptPath, "utf-8");
    console.log("Prompt file content loaded successfully");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `${prompt}\n\n${text}` },
      ],
      max_tokens: 15000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Failed to get summary content");
    }
    const summary = content;
    return summary;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to summarize the text");
  }
}
