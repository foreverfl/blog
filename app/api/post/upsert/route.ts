import { NextResponse } from "next/server";
import { upsertFilePathsToMongoDB } from "@/lib/mongodb";

// POST 요청을 처리
export async function GET() {
  try {
    const result = await upsertFilePathsToMongoDB();
    console.log("Upserted posts:", result);
    return NextResponse.json({
      message: `Upserted ${result.upsertedCount} posts successfully.`,
      status: "success",
    });
  } catch (error) {
    console.error("Error upserting posts:", error);
    return NextResponse.json(
      {
        message: "Error upserting posts",
        status: "error",
      },
      {
        status: 500,
      }
    );
  }
}
