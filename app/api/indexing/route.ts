import { getAllMdxFilesWithFrontMatter } from "@/lib/content/mdxHelpers";
import {
  getFuseCache,
  SearchItem,
  setFuseCache,
} from "@/lib/indexing/fuseCache";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const indexingJobs = new Map<
  string,
  { status: string; started: number; finished?: number; error?: string }
>();

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "";
  if (!origin.startsWith(`${process.env.NEXT_PUBLIC_BASE_URL}`)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const job_id = uuidv4();
  indexingJobs.set(job_id, { status: "pending", started: Date.now() });

  doIndexing(job_id);

  return NextResponse.json({ job_id, status: "pending" });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const job_id = url.searchParams.get("job_id");
  const lang = url.searchParams.get("lang") || "en";

  // if job_id is provided, return job status
  if (job_id && indexingJobs.has(job_id)) {
    return NextResponse.json(indexingJobs.get(job_id));
  }

  // if no job_id, return all jobs
  const data = getFuseCache(lang);
  return NextResponse.json(data);
}

async function doIndexing(job_id: string) {
  try {
    const prevJob = indexingJobs.get(job_id);
    indexingJobs.set(job_id, {
      ...prevJob,
      status: "processing",
      started: prevJob?.started ?? Date.now(),
    });

    // 1. post type
    const langs = ["en", "ko", "ja"];
    let postItems: any[] = [];

    for (const lang of langs) {
      const posts = await getAllMdxFilesWithFrontMatter(lang);
      postItems.push(
        ...posts.map((post: any) => ({
          title: post.frontmatter.title,
          content: post.content,
          link: `/${lang}/${post.frontmatter.classification}/${post.frontmatter.category}/${(post.frontmatter.fileName ?? "").replace(/\.mdx$/, "")}`,
          type: "post",
          lang,
        })),
      );
    }

    // 3. Combine and set cache
    const allItems: SearchItem[] = [...postItems];
    setFuseCache(allItems);

    indexingJobs.set(job_id, {
      status: "completed",
      started: prevJob?.started ?? Date.now(),
      finished: Date.now(),
      error: prevJob?.error,
    });
  } catch (err: any) {
    const prevJob = indexingJobs.get(job_id);
    indexingJobs.set(job_id, {
      status: "failed",
      started: prevJob?.started ?? Date.now(),
      finished: Date.now(),
      error: err?.message ?? String(err),
    });
  }
}
