import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

dotenv.config({ path: "./.env.local" });

export async function draw(promptText: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log("promptText:", promptText);

    const stylePath = path.resolve(
      new URL(import.meta.url).pathname,
      "../../prompts/picture-style.txt"
    );
    console.log("Style file path:", stylePath);
    const stylePrompt = fs.readFileSync(stylePath, "utf-8");

    const fullPrompt = `
        ${stylePrompt}

        Now, illustrate the following theme with the style described above:
        ${promptText}
    `.trim();

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
