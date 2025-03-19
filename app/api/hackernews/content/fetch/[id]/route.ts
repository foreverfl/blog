import { fetchArticleContent } from "@/lib/hackernews/fetchArticleContent";
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(request: Request) {
  const id = request.url.split("/").pop();

  if (!id) {
    return NextResponse.json({ ok: false, error: "There is no id" });
  }

  const foundItem = await getHackernewsItemById(id);

  if (!foundItem || !foundItem.url) {
    return NextResponse.json({ ok: false, error: "Item or URL not found" });
  }

  const content = await fetchArticleContent(foundItem.url);
  console.log("크롤링된 content:", content?.slice(0, 100)); // 일부만 출력

  // 파일 저장 (모듈화 필요)
  // 날짜 파일 열기
  const now = new Date();
  const dateString = `${now.getFullYear().toString().slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const dailyFilePath = path.join(
    process.cwd(),
    "contents",
    "hackernews",
    `${dateString}.json`
  );

  let dailyData: any[] = [];
  try {
    const dailyFile = await fs.readFile(dailyFilePath, "utf-8");
    dailyData = JSON.parse(dailyFile);
  } catch (err) {
    console.log("오늘 파일이 없어서 새로 생성합니다.");
    dailyData = [];
  }

  // 배열에 추가
  dailyData.push({ ...foundItem, content });

  // 다시 저장
  await fs.writeFile(
    dailyFilePath,
    JSON.stringify(dailyData, null, 2),
    "utf-8"
  );
  console.log(`✅ ${dailyFilePath} 에 데이터가 추가되었습니다.`);

  return NextResponse.json(foundItem);
}
