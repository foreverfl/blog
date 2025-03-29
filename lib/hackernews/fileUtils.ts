import { promises as fs } from "fs";
import path from "path";

export async function getDailyFilePath(baseFolder: string, dateStr?: string) {
  let dateString: string;

  if (dateStr) {
    if (!/^\d{6}$/.test(dateStr)) {
      throw new Error("Invalid date format. Expected 'YYMMDD'.");
    }
    dateString = dateStr;
  } else {
    const now = new Date();

    const year = now.getFullYear() % 100;
    const month = now.getMonth() + 1;
    const day = now.getDate();

    dateString = `${year.toString().padStart(2, "0")}${month
      .toString()
      .padStart(2, "0")}${day.toString().padStart(2, "0")}`;
  }
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
