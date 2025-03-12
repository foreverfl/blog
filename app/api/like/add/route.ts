import { NextRequest, NextResponse } from "next/server";
import { addLikeToPost } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { pathHash, userEmail } = await req.json();

    if (!pathHash || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await addLikeToPost(pathHash, userEmail);
    return NextResponse.json(
      { message: "Like added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding like:", error);
    return NextResponse.json({ error: "Failed to add like" }, { status: 500 });
  }
}
