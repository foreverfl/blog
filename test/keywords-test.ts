import { keywords } from "@/lib/openai/keywords";

(async () => {
  try {
    const testDate = "250329"; 
    const result = await keywords(testDate);
    console.log("Test result: ", result);
  } catch (error) {
    console.error("Test failed: ", error);
  }
})();
