import { getPostByIndex } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { index: string } }
) {
  const postExists = await getPostByIndex(Number(params.index));

  if (postExists) {
    return new NextResponse(JSON.stringify(postExists), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new NextResponse(JSON.stringify({ message: "Post not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}
