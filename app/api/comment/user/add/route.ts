import { NextResponse } from "next/server";
import { addUserCommentToPost, getCommentsForPost } from "@/lib/mongodb";

interface Comment {
  _id: string;
  userEmail: string;
  username: string;
  photo: string;
  comment: string;
  userCreatedAt: string;
  adminComment: string;
  adminCreatedAt: string | null;
}

export async function POST(request: Request) {
  const { pathHash, commentData } = await request.json();

  await addUserCommentToPost(pathHash, commentData);
  const updatedComments: Comment[] = await getCommentsForPost(pathHash);

  const latestComment = updatedComments
    .filter((comment: Comment) => comment.userCreatedAt) // userCreatedAt이 있는 것만 필터링
    .sort(
      (a: Comment, b: Comment) =>
        new Date(b.userCreatedAt).getTime() -
        new Date(a.userCreatedAt).getTime()
    )[0];

  return NextResponse.json(latestComment);
}
``;
