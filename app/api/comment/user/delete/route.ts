import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, userEmail } = await request.json();

  await deleteComment(pathHash, commentId, userEmail);

  return NextResponse.json({ deletedCommentId: commentId });
}
