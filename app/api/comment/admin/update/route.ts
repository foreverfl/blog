import { NextResponse } from "next/server";
import { updateAdminComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, newAdminComment } = await request.json();

  const result = await updateAdminComment(pathHash, commentId, newAdminComment);
  return NextResponse.json(result);
}
