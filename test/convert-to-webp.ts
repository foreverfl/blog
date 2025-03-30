import fs from "fs";
import path from "path";
import sharp from "sharp";

(async () => {
  const args = process.argv.slice(2);
  const prefix = args[0];

  if (!prefix) {
    console.error("❗ Usage: tsx convert-to-webp.ts <prefix>");
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), "public/images/contents");
  const files = fs.readdirSync(targetDir);

  const matchedFiles = files.filter((file) => file.startsWith(prefix));

  if (matchedFiles.length === 0) {
    console.log("⚠️ No matching files found.");
    return;
  }

  for (const file of matchedFiles) {
    const filePath = path.join(targetDir, file);
    const fileNameWithoutExt = path.parse(file).name;
    const outputPath = path.join(targetDir, `${fileNameWithoutExt}.webp`);

    try {
      await sharp(filePath).webp({ quality: 90 }).toFile(outputPath);
      fs.unlinkSync(filePath);
      console.log(`✅ Converted and removed: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error);
    }
  }
})();
