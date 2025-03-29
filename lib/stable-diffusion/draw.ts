import axios from "axios";
import fs from "fs";
import path from "path";

export async function drawWithStableDiffusion(promptText: string): Promise<string> {
  const stylePath = path.resolve(
    new URL(import.meta.url).pathname,
    "../../prompts/picture-style.txt"
  );

  const stylePrompt = fs.readFileSync(stylePath, "utf-8");

  const fullPrompt = `
${stylePrompt.trim()}

Now, illustrate the following theme with the style described above:
${promptText.trim()}
  `.trim();

  const negativePrompt = `(worst quality, low quality:1.4), blurry, watermark, text, signature, extra fingers, ugly, deformed, cropped`;

  const payload = {
    prompt: fullPrompt,
    negative_prompt: negativePrompt,
    steps: 25,
    cfg_scale: 7.5,
    width: 1024,
    height: 1024,
    sampler_name: "DPM++ 2M Karras",
    batch_size: 1,
    n_iter: 1,
    seed: -1,
  };

  try {
    const response = await axios.post("http://127.0.0.1:7860/sdapi/v1/txt2img", payload);
    const imageBase64 = response.data.images?.[0];
    if (!imageBase64) throw new Error("No image returned from Stable Diffusion");

    // 저장하고 URL로 반환
    const outputPath = path.resolve("output", `image-${Date.now()}.png`);
    fs.writeFileSync(outputPath, Buffer.from(imageBase64, "base64"));
    console.log("✅ Image saved:", outputPath);
    return outputPath;
  } catch (error) {
    console.error("❌ Failed to generate image:", error);
    throw new Error("Stable Diffusion generation failed");
  }
}
