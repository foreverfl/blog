import { getContents, getContentsStructure } from "@/lib/content/jsonHelpers";
import { getAllMdxFilesWithFrontMatter } from "@/lib/content/mdxHelpers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // URL에서 쿼리 파라미터를 가져옴
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lan") || "ko"; // 기본 값은 'ko'

  // MDX files
  const posts = await getAllMdxFilesWithFrontMatter(lang);

  // const foldersAndDates = await getContentsStructure(classification!);

  // const trendsDataPromises = foldersAndDates.map(async ({ folder, dates }) => {
  //   const dateDataPromises = dates.map(async (date) => {
  //     try {
  //       const data = await getContents(folder, date);
  //       const summary = data.summary
  //         ? { en: data.summary.en, ko: data.summary.ko, ja: data.summary.ja }
  //         : null;
  //       return { date, summary };
  //     } catch (error) {
  //       console.error(`Error fetching data for ${folder} - ${date}:`, error);
  //       return { date, summary: null };
  //     }
  //   });

  //   const dateData = await Promise.all(dateDataPromises);
  //   return { folder, dateData };
  // });

  // const trendsData = await Promise.all(trendsDataPromises);
  // console.log("trendsData: ", JSON.stringify(trendsData, null, 2));
  return NextResponse.json({
  });

  return NextResponse.json({
    posts,
  });
}
