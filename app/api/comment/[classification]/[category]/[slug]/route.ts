import { createComment, getCommentsForPost } from "@/lib/postgres/comments";
import { getPost } from "@/lib/postgres/posts";
import { NextRequest, NextResponse } from "next/server";

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
  return NextResponse.json(comments);
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
  return NextResponse.json(comment);
}
