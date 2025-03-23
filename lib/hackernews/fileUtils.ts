import { promises as fs } from "fs";
import path from "path";

export async function getDailyFilePath(baseFolder: string) {
  const now = new Date();
  const dateString = `${now.getFullYear().toString().slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  return path.join(process.cwd(), baseFolder, `${dateString}.json`);
}

export async function readJsonFile(filePath: string) {
  try {
    const file = await fs.readFile(filePath, "utf-8");
    return JSON.parse(file);
  } catch (err) {
    console.log(`${filePath} not found. Will create a new file.`);
    return [];
  }
}

export async function writeJsonFile(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Saved to ${filePath}`);
}