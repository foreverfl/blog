import { deleteAdminReply, upsertAdminReply } from "@/lib/postgres/comments";
import { NextRequest, NextResponse } from "next/server";

// 관리자 답글 추가/수정
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      classification: string;
      category: string;
      slug: string;
      comment_id: string;
    }>;
  },
) {
  const { comment_id } = await params;
  const { reply } = await req.json();
  const comment = await upsertAdminReply(comment_id, reply);
  return NextResponse.json(comment);
}

// 관리자 답글 삭제
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      classification: string;
      category: string;
      slug: string;
      comment_id: string;
    }>;
  },
) {
  const { comment_id } = await params;
  const comment = await deleteAdminReply(comment_id);
  return NextResponse.json(comment);
}
