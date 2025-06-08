import { createComment, getCommentsForPost } from "@/lib/postgres/comments";
import { getPost } from "@/lib/postgres/posts";
import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

// fetch all comments for a specific post
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ classification: string; category: string; slug: string }>;
  },
) {
  const { classification, category, slug } = await params;
  const post = await getPost(classification, category, slug);
  if (!post)
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const comments = await getCommentsForPost(post.id);
  const camelComments = camelcaseKeys(comments as any, { deep: true });
  return NextResponse.json(camelComments);
}

// create a new comment for a specific post
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ classification: string; category: string; slug: string }>;
  },
) {
  const { classification, category, slug } = await params;
  const { user_id, user_photo, content } = await req.json();
  const post = await getPost(classification, category, slug);
  if (!post)
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const comment = await createComment({
    post_id: post.id,
    user_id,
    user_photo,
    content,
  });

  const camelComment = camelcaseKeys(comment as any, { deep: true });

  return NextResponse.json(camelComment);
}
