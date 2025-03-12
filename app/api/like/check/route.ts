import { NextRequest, NextResponse } from "next/server";
import { checkLikeStatus } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pathHash = searchParams.get("pathHash");
  const userEmail = searchParams.get("userEmail");

  if (!pathHash || !userEmail) {
    return new NextResponse("Missing pathHash or userEmail", { status: 400 });
  }

  try {
    const isLiked = await checkLikeStatus(pathHash, userEmail);
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error("Error checking like status:", error);
    return new NextResponse("Error checking like status", { status: 500 });
  }
}
