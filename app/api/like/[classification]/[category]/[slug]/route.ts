import {
  addLike,
  countLikes,
  hasLiked,
  removeLike,
} from "@/lib/postgres/likes";
import { getPost } from "@/lib/postgres/posts";
import { findUserByEmail } from "@/lib/postgres/users";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve like count & like status
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ classification: string; category: string; slug: string }>;
  },
) {
  try {
    const { classification, category, slug } = await params;
    const userEmail = req.nextUrl.searchParams.get("userEmail");

    const post = await getPost(classification, category, slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const likeCount = await countLikes(post.id);

    let liked = false;
    if (userEmail) {
      const user = await findUserByEmail(userEmail);
      if (user) liked = await hasLiked(post.id, user.id);
    }

    return NextResponse.json({ likeCount, liked });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch like status" },
      { status: 500 },
    );
  }
}

// POST: Add like
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ classification: string; category: string; slug: string }>;
  },
) {
  try {
    const { userEmail } = await req.json();
    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    const { classification, category, slug } = await params;

    const user = await findUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await getPost(classification, category, slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await addLike(post.id, user.id);
    return NextResponse.json({ message: "Like added" });
  } catch (e) {
    return NextResponse.json({ error: "Failed to add like" }, { status: 500 });
  }
}

// DELETE: Remove like
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ classification: string; category: string; slug: string }>;
  },
) {
  try {
    const userEmail = (await req.json()).userEmail;
    const { classification, category, slug } = await params;

    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail" }, { status: 400 });
    }

    const user = await findUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await getPost(classification, category, slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await removeLike(post.id, user.id);
    return NextResponse.json({ message: "Like removed" });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to remove like" },
      { status: 500 },
    );
  }
}
