import fs from "fs";
import path from "path";
import sharp from "sharp";

const DELETE_ORIGINAL = true;

(async () => {
  const targetDir = path.join(
    process.cwd(),
    "/public/tmp/",
  );
  const files = fs.readdirSync(targetDir);

  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png"].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log("⚠️ No image files to process.");
    return;
  }

  for (const file of imageFiles) {
    const filePath = path.join(targetDir, file);
    const fileNameWithoutExt = path.parse(file).name;
    const outputPath = path.join(targetDir, `${fileNameWithoutExt}.webp`);

    try {
      await sharp(filePath).webp({ quality: 90 }).toFile(outputPath);

      if (DELETE_ORIGINAL) {
        fs.unlinkSync(filePath);
        console.log(`✅ Converted and deleted: ${file}`);
      } else {
        console.log(`✅ Converted (kept original): ${file}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error);
    }
  }
})();
