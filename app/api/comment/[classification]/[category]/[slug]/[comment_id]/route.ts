import { deleteComment, updateComment } from "@/lib/postgres/comments";
import { NextRequest, NextResponse } from "next/server";

// update a comment
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
  const { content } = await req.json();
  // user_id 체크(권한 확인) 추가 권장
  const comment = await updateComment({ id: comment_id, content });
  if (!comment) {
    return NextResponse.json({ error: "There is no comment" }, { status: 404 });
  }
  return NextResponse.json(comment);
}

// delete a comment
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
  if (deleted) {
    return NextResponse.json({ deletedCommentId: comment_id });
  } else {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
}
