import { getFromR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

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

  const dateString = date ?? getTodayKST();

  try {
    const key = `${dateString}.json`;
    const items = await getFromR2({ bucket: "hackernews", key });

    if (!items || !Array.isArray(items)) {
      throw new Error("No valid items found in R2");
    }

    const topItem = items.filter((item: any) => {
      const en = item.summary?.en;
      return typeof en === "string" && en.trim().length > 0;
    })[0];
    // .sort((a: any, b: any) => b.score - a.score)[0];

    const summary = topItem?.summary?.en || "No valid item found";
    console.log("Extracted summary:", summary);

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mogumogu.dev";
    const res = await fetch(`${siteUrl}/prompts/picture-keywords.md`);
    if (!res.ok) throw new Error("Prompt file fetch failed");
    const keywordsPrompt = await res.text();
    console.log("Keywords prompt file content loaded successfully");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: keywordsPrompt,
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
    console.log("keywords:", parsedResponse);
    return JSON.stringify(parsedResponse);
  } catch (error) {
    console.error("❌ Error extracting keywords:", error);
    throw new Error("Failed to extract keywords");
  }
}
