import { NextResponse } from "next/server";
import { updateUserComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, newComment } = await request.json(); // Body에서 데이터 가져오기

  const result = await updateUserComment(pathHash, commentId, newComment);
  return NextResponse.json(result);
}
