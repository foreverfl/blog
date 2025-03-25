import { checkBearerAuth } from "@/lib/auth";
import { getDailyFilePath, readJsonFile } from "@/lib/hackernews/fileUtils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  try {
    const dailyFilePath = await getDailyFilePath("contents/hackernews");
    const dailyData = await readJsonFile(dailyFilePath);

    if (!Array.isArray(dailyData)) {
      return NextResponse.json({
        ok: false,
        error: "Daily data is not an array",
      });
    }

    const nullContentCount = dailyData.filter(
      (item: { content: string | null | undefined }) =>
        !item.content || item.content.trim() === ""
    ).length;

    return NextResponse.json({
      ok: true,
      count: nullContentCount,
      message: `The number of null contents: ${nullContentCount}`,
    });
  } catch (error) {
    console.error("❌ Error while reading daily data:", error);
    return NextResponse.json({
      ok: false,
      error: "Failed to process daily data",
    });
  }
}
