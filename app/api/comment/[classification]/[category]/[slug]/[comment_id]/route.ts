import { deleteComment, updateComment } from "@/lib/postgres/comments";
import { NextRequest, NextResponse } from "next/server";

// 댓글 수정
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
  const { user_id, content } = await req.json();
  // user_id 체크(권한 확인) 추가 권장
  const comment = await updateComment({ id: comment_id, content });
  return NextResponse.json(comment);
}

// 댓글 삭제
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
  const { user_id } = await req.json();
  const deleted = await deleteComment(comment_id, user_id);
  return NextResponse.json({ deleted });
}
