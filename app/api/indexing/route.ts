import { checkBearerAuth } from "@/lib/auth";
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
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) {
    return authResult;
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

    // 2. trend type (hackernews)
    // const listResult = await listFromR2("hackernews");
    // let trendItems: any[] = [];
    // if (listResult?.dates) {
    //   const concurrency = 8;
    //   const chunks: any[] = [];
    //   for (let i = 0; i < listResult.dates.length; i += concurrency) {
    //     const slice = listResult.dates.slice(i, i + concurrency);
    //     const promises = slice.map((date: string) =>
    //       getFromR2({ bucket: "hackernews", key: `${date}.json` }).catch(
    //         () => null,
    //       ),
    //     );
    //     chunks.push(...(await Promise.all(promises)));
    //   }
    //   trendItems = chunks
    //     .filter(Boolean)
    //     .flat()
    //     .map((item: any) => ({
    //       title: `[hackernews] ${item.date ?? ""}`,
    //       content: item.summary?.ko || item.summary?.en || "",
    //       link: `/ko/trends/hackernews/${item.date}`,
    //       type: "trend",
    //     }));
    // }

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
