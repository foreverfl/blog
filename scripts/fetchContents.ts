import { getFromR2, putToR2 } from "@/lib/cloudflare/r2";
import { getTodayKST } from "@/lib/date";
import { fetchContent } from "@/lib/hackernews/fetchContent";
import { fetchPdfContent } from "@/lib/hackernews/fetchPdfContent";
import { getHackernewsItemById } from "@/lib/hackernews/getHackernewItem";
import { sliceTextByTokens } from "@/lib/text";
import dotenv from "dotenv";

dotenv.config();

async function run(inputDate?: string) {
  const fallbackDate = getTodayKST();
  const dateKey = inputDate || fallbackDate;
  const key = `${dateKey}.json`;

  let dailyData = await getFromR2({ bucket: "hackernews", key });
  if (!Array.isArray(dailyData)) {
    console.error(
      `❌ dailyData from R2 is invalid or not found for key: ${key}`
    );
    return;
  }

  for (let i = 0; i < dailyData.length; i++) {
    const item = dailyData[i];

    if (item.content) {
      console.log(`⏭️ Skipping ID ${item.id} (already has content)`);
      continue;
    }

    const foundItem = await getHackernewsItemById(item.id);
    if (!foundItem?.url) {
      console.warn(`⚠️ No URL found for ID ${item.id}`);
      continue;
    }

    try {
      let fetchedContent: string | null = null;

      if (foundItem.url.includes(".pdf")) {
        fetchedContent = await fetchPdfContent(foundItem.url);
        console.log(`📄 PDF content extracted for ${foundItem.url}`);
      } else {
        fetchedContent = await fetchContent(foundItem.url);
        console.log(`🌐 Smart content fetched for ${foundItem.url}`);
      }

      if (!fetchedContent) {
        console.warn(`⚠️ No content for ID ${item.id}`);
        continue;
      }

      const sliced = await sliceTextByTokens(fetchedContent, 15000);
      dailyData[i].content = sliced;
    } catch (err) {
      console.error(`❌ Failed to fetch content for ID ${item.id}:`, err);
      continue;
    }
  }

  await putToR2({ bucket: "hackernews", key }, dailyData);
  console.log(`📝 R2 updated for key: ${key}`);
}

const inputDate = process.argv[2];
run(inputDate);