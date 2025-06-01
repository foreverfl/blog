import { NextResponse } from "next/server";
import { deleteAdminComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, userEmail } = await request.json();

  const result = await deleteAdminComment(pathHash, commentId);
  return NextResponse.json(result);
}
