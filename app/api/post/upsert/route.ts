import { NextRequest, NextResponse } from "next/server";
import { upsertFilePathsToMongoDB } from "@/lib/mongodb";

export const POST = async (req: NextRequest) => {
  try {
    const result = await upsertFilePathsToMongoDB();
    return NextResponse.json({
      message: "File paths upserted successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to upsert file paths", error },
      { status: 500 }
    );
  }
};
