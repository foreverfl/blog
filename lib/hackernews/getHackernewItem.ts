import { getFromR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";

export async function getHackernewsItemById(id: string) {
  const today = getTodayKST();

  try {
    const json = await getFromR2({
      bucket: "hackernews",
      key: `${today}.json`,
    });
    const foundItem = json.find((item: any) => item.id === id);

    return foundItem;
  } catch (error) {
    console.error("파일 읽기 오류:", error);
    return null;
  }
}
