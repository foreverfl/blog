import { NextRequest, NextResponse } from "next/server";
import { removeLikeFromPost } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { pathHash, userEmail } = await req.json();

    if (!pathHash || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await removeLikeFromPost(pathHash, userEmail);
    return NextResponse.json(
      { message: "Like removed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing like:", error);
    return NextResponse.json(
      { error: "Failed to remove like" },
      { status: 500 },
    );
  }
}
