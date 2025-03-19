import { promises as fs } from "fs";
import path from "path";

export async function getHackernewsItemById(id: string) {

  const now = new Date();
  const dateString = `${now.getFullYear().toString().slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const filePath = path.join(
    process.cwd(),
    "contents",
    "hackernews",
    `${dateString}.json`
  );

  try {

    const data = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(data);

    const foundItem = json.find((item: any) => item.id === id);
    return foundItem;
  } catch (error) {
    console.error("파일 읽기 오류:", error);
    return null;
  }
}
