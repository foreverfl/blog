import { deleteAdminReply, upsertAdminReply } from "@/lib/postgres/comments";
import camelcaseKeys from "camelcase-keys";
import { NextRequest, NextResponse } from "next/server";

// update an admin reply to a comment
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
  const camelComment = camelcaseKeys(comment as any, { deep: true });
  return NextResponse.json(camelComment);
}

// delete an admin reply to a comment
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
  const camelComment = camelcaseKeys(comment as any, { deep: true });
  return NextResponse.json(camelComment);
}
