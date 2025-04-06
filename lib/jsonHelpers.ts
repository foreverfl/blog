import { getFromR2 } from "@/lib/cloudflare/r2";

export async function getContentsStructure(
  bucket: string
): Promise<{ folder: string; dates: string[] }[]> {
  if (!bucket || bucket === "null") {
    throw new Error("❌ Bucket name is invalid or null");
  }

  console.log(bucket);
  const listUrl = `${process.env.NEXT_PUBLIC_R2_URI}/${bucket}`;
  const res = await fetch(listUrl);

  if (!res.ok) {
    throw new Error(
      `❌ Failed to list R2 contents from bucket "${bucket}": ${res.statusText}`
    );
  }

  const result = await res.json();

  const files = result.files || result.dates || [];

  const dates = files
    .map((filename: string) => filename.replace(/\.[^/.]+$/, ""))
    .filter((v: string) => !!v);

  return [
    {
      folder: bucket,
      dates,
    },
  ];
}

export async function getContents(folder: string, date: string) {
  const key = `${date}.json`;
  const bucket = "hackernews";

  const data = await getFromR2({ bucket, key });

  if (!data) {
    throw new Error(`❌ No content found for ${folder}/${date}`);
  }

  return data;
}
