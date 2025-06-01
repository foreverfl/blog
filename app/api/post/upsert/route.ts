import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    return NextResponse.json({
      message: "File paths upserted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to upsert file paths", error },
      { status: 500 },
    );
  }
};
