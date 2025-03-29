import { drawWithStableDiffusion } from "@/lib/stable-diffusion/draw";

(async () => {
  const prompt = `
In March 2025, a group of hackers, including Roni Carta, Justin Gardner, and Joseph Thacker, 
successfully discovered and leaked parts of Google's A.I. model, Gemini, during a bug-hunting event in Las Vegas. 
Their journey highlighted the rapid advancements and security challenges in Generative AI and LLMs.
`;

  try {
    const resultPath = await drawWithStableDiffusion(prompt);
    console.log("🎉 Image generated and saved to:", resultPath);
  } catch (error) {
    console.error("🔥 Error in draw-test:", error);
  }
})();
