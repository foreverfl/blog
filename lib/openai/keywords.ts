import dotenv from "dotenv";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getDailyFilePath, readJsonFile } from "../hackernews/fileUtils";

dotenv.config({ path: "./.env.local" });

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

export async function keywords(date: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const today = new Date();
  today.setHours(today.getHours() + 9);
  const defaultDate = today.toISOString().slice(2, 10).replace(/-/g, "");
  const dateString = date ?? defaultDate;

  try {
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts image-related details from a summary text. Please extract the following details: person (gender, age, emotion), object, action, and background (indoor/outdoor, time of day). Use your imagination to create a vivid scenario based on the summary.",
        },
        { role: "user", content: summary },
      ],
      temperature: 1.0,
      response_format: zodResponseFormat(ImageInfoSchema, "event"),
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Content is null or undefined");
    }
    const parsedResponse = ImageInfoSchema.parse(JSON.parse(content));
    console.log("Parsed response:", parsedResponse);
    return JSON.stringify(parsedResponse);
  } catch (error) {
    console.error("❌ Error extracting keywords:", error);
    throw new Error("Failed to extract keywords");
  }
}
