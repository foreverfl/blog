import { getFromR2 } from "@/lib/cloudflare/r2";

export async function getHackernewsItemById(id: string) {
  const now = new Date();
  const dateString = `${now.getFullYear().toString().slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  try {
    const json = await getFromR2({
      bucket: "hackernews",
      key: `${dateString}.json`,
    });
    const foundItem = json.find((item: any) => item.id === id);

    return foundItem;
  } catch (error) {
    console.error("파일 읽기 오류:", error);
    return null;
  }
}
