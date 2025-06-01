import { draw } from "@/lib/openai/draw";

(async () => {
  const testDate = "250328";

  try {
    const resultUrl = await draw(testDate);
    console.log("🎉 Image generated and URL:", resultUrl);
  } catch (error) {
    console.error("🔥 Error in drawing image:", error);
  }
})();
