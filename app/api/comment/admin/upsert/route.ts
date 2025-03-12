import { NextResponse } from "next/server";
import { upsertAdminComment } from "@/lib/mongodb";

export async function POST(request: Request) {
  const { pathHash, commentId, adminComment } = await request.json();
  const result = await upsertAdminComment(pathHash, commentId, adminComment);
  return NextResponse.json(result);
}
