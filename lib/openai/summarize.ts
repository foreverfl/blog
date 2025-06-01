import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config({ path: "./.env.local" });

export async function summarize(text: string): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get the prompt file from the server
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${siteUrl}/prompts/summary.md`);

    if (!res.ok) throw new Error("Prompt file fetch failed");
    const prompt = await res.text();

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
