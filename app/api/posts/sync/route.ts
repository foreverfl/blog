import { checkBearerAuth } from "@/lib/auth";
import { getAllMdxFilesWithFrontMatter } from "@/lib/content/mdxHelpers";
import { createPostUniqueId, upsertPost } from "@/lib/postgres/posts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
  }

  const frontmatters = await getAllMdxFilesWithFrontMatter("ko"); // Todo: en으로 변경 필요
  for (const item of frontmatters) {
    const uuid = createPostUniqueId(
      item.frontmatter.date,
      item.frontmatter.title,
    );
    await upsertPost(uuid);
  }

  return NextResponse.json({ ok: true });
}
