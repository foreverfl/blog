import { keywords } from "@/lib/openai/keywords";
import dotenv from "dotenv";
import fs from "fs";
import { OpenAI } from "openai";
import path from "path";

dotenv.config({ path: "./.env.local" });

export async function draw(date: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const extractedKeywords = await keywords(date);

    const stylePath = path.resolve(
      new URL(import.meta.url).pathname,
      "../../prompts/picture-style.md"
    );
    const stylePrompt = fs.readFileSync(stylePath, "utf-8");
    const styleKeywords = parseStylePrompt(stylePrompt);

    const fullPrompt = `
        ${styleKeywords}
        Now, illustrate the following theme with the style described above:
        ${extractedKeywords}
    `.trim();
    console.log("Full prompt for image generation:", fullPrompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "url",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    console.log("🎨 Image generated:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("❌ Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}

function parseStylePrompt(stylePrompt: string): string {
  const lines = stylePrompt.split("\n").filter(line => line.trim() !== "");

  let formattedKeywords = "";

  lines.forEach(line => {
    if (line.startsWith("-")) {
      const keyword = line.slice(1).trim(); 
      formattedKeywords += `${keyword}, `;
    }
  });

  return formattedKeywords.trim().replace(/,$/, "");
}