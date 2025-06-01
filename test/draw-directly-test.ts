import { drawDirectly } from "@/lib/openai/draw-directly";
import axios from "axios";
import fs from "fs";
import path from "path";

(async () => {
  try {
    const imageUrl = await drawDirectly(
      "male", // gender
      "teenager", // age
      "nervous", // emotion (운전하면서 긴장한 느낌)
      "car", // object
      "signaling left, changing lanes", // action (깜빡이 켜고 차선 변경)
      "outdoor", // indoorOutdoor
      "Japanese highway interchange with traffic jam, other cars making way like the Red Sea", // background
      "day", // timeOfDay
    );
    console.log("✅ Image URL:", imageUrl);

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fileName = `image-${timestamp}-${randomSuffix}.png`;
    const desktopPath = "/mnt/c/Users/forev/OneDrive/바탕 화면";
    const savePath = path.join(desktopPath, fileName);

    fs.writeFileSync(savePath, response.data);
    console.log("📁 Image saved to:", savePath);
  } catch (error) {
    console.error("❌ Failed to generate image:", error);
  }
})();
