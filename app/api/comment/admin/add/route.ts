import { NextResponse } from "next/server";
import { addAdminComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, adminComment } = await request.json();
  const result = await addAdminComment(pathHash, commentId, adminComment);

  return NextResponse.json(result);
}
