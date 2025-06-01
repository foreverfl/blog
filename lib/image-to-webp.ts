import fs from "fs";
import path from "path";
import sharp from "sharp";

/**
 * Convert all images in the source directory to WebP and save them in the destination directory.
 * @param sourceDir - Directory to read the original images from
 * @param destDir - Directory to save the converted WebP images
 */
export async function convertImagesToWebp(
  sourceDir: string,
  destDir: string,
): Promise<void> {
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);
    const imageFiles = files.filter(
      (file) =>
        file.endsWith(".png") ||
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".gif") ||
        file.endsWith(".svg"),
    );

    console.log(`Found ${imageFiles.length} image(s) to convert...`);

    for (const file of imageFiles) {
      const inputPath = path.join(sourceDir, file);
      const outputPath = path.join(destDir, `${path.parse(file).name}.webp`);

      await sharp(inputPath).webp().toFile(outputPath);

      console.log(`✅ Converted: ${file} -> ${outputPath}`);
    }

    console.log("All images have been converted to WebP format!");
  } catch (error) {
    console.error("❌ Error during image conversion:", error);
    throw new Error("Failed to convert images to WebP");
  }
}
