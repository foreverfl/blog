import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeEnglish(content: string) {
  const prompt = `Summarize the following article in English:\n\n${content}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function translateToKorean(content: string) {
  const prompt = `Translate the following English text into Korean:\n\n${content}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function translateToJapanese(content: string) {
  const prompt = `Translate the following English text into Japanese:\n\n${content}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices?.[0]?.message?.content?.trim() ?? "";
}
