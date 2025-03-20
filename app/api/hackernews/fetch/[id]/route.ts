import { fetchArticleContent } from "@/lib/hackernews/fetchArticleContent";
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import {
  getDailyFilePath,
  readJsonFile,
  writeJsonFile,
} from "@/lib/hackernews/fileUtils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const id = request.url.split("/").pop();

  if (!id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  const foundItem = await getHackernewsItemById(id);

  if (!foundItem || !foundItem.url) {
    return NextResponse.json({ ok: false, error: "Item or URL not found" });
  }

  const content = await fetchArticleContent(foundItem.url);
  console.log("part of content:", content?.slice(0, 100));

  const dailyFilePath = await getDailyFilePath("contents/hackernews");
  let dailyData = await readJsonFile(dailyFilePath);

  const existingIndex = dailyData.findIndex(
    (item: { id: any }) => item.id === foundItem.id
  );

  dailyData[existingIndex].content = content;

  await writeJsonFile(dailyFilePath, dailyData);

  const updatedItem = dailyData.find(
    (item: { id: any }) => item.id === foundItem.id
  );

  return NextResponse.json(updatedItem);
}
