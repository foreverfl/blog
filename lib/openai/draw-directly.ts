import dotenv from "dotenv";
import { OpenAI } from "openai";
import { z } from "zod";

dotenv.config({ path: "./.env.local" });

export async function drawDirectly(
  gender: string = "",
  age: string = "",
  emotion: string = "",
  object: string = "",
  action: string = "",
  indoorOutdoor: string = "",
  background: string = "",
  timeOfDay: string = ""
): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const ImageInfoSchema = z.object({
      whatIsInTheImage: z.object({
        person: z.object({
          gender: z.literal("female"),
          age: z.literal("teenager"),
          emotion: z.string().optional(),
        }),
        object: z.string().optional(),
        action: z.string().optional(),
      }),
      background: z.object({
        indoorOutdoor: z.string().optional(),
        background: z.string().optional(),
        timeOfDay: z.string().optional(),
      }),
    });

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mogumogu.dev";
    const res = await fetch(`${siteUrl}/prompts/picture-style.md`);
    if (!res.ok) throw new Error("Style prompt fetch failed");

    const stylePrompt = await res.text();
    const styleKeywords = parseStylePrompt(stylePrompt);


    const flattenedKeywords = {
      whatIsInTheImage: flattenToArray({
        person: {
          gender,
          age,
          emotion,
        },
        object,
        action,
      }),
      background: flattenToArray({
        indoorOutdoor,
        background,
        timeOfDay,
      }),
    };

    const fullPrompt = {
      style: styleKeywords.style,
      mood: styleKeywords.mood,
      perspective: styleKeywords.perspective,
      colors: styleKeywords.colors,
      additionalEffects: styleKeywords.additionalEffects,
      whatisInTheImage: flattenedKeywords.whatIsInTheImage,
      background: flattenedKeywords.background,
    };

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: JSON.stringify(fullPrompt),
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

function parseStylePrompt(stylePrompt: string): any {
  const lines = stylePrompt.split("\n").filter((line) => line.trim() !== "");

  const result: any = {
    style: [],
    mood: [],
    perspective: [],
    colors: [],
    additionalEffects: [],
  };

  let currentCategory = "";

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("## ")) {
      // Category detected (Style, Mood, etc.)
      currentCategory = trimmedLine.slice(3).toLowerCase();
    } else if (trimmedLine.startsWith("-")) {
      const keyword = trimmedLine.slice(1).trim();

      // Add the keyword to the corresponding category
      if (currentCategory) {
        result[currentCategory].push(keyword);
      }
    }
  });

  return result;
}

function flattenToArray(obj: any): any[] {
  const result: any[] = [];

  // If obj is an array, iterate over each item and recursively flatten
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      result.push(...flattenToArray(item));
    });
  } else if (obj && typeof obj === "object") {
    // If obj is an object, iterate over each key and recursively flatten its value
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result.push(...flattenToArray(obj[key]));
      }
    }
  } else {
    result.push(obj);
  }

  return result;
}
