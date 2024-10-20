import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, userEmail } = await request.json();

  const result = await deleteComment(pathHash, commentId, userEmail);
  return NextResponse.json(result);
}
