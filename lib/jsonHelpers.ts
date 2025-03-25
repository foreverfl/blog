import fs from "fs";
import path from "path";

export async function getContentsStructure() {
  const contentsPath = path.resolve(process.cwd(), "contents", "trends");
  const folders = fs
    .readdirSync(contentsPath)
    .filter((file) => fs.statSync(path.join(contentsPath, file)).isDirectory());

  const structure = folders.map((folder) => {
    const folderPath = path.join(contentsPath, folder);
    const dates = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""));
    return { folder, dates };
  });

  return structure;
}
