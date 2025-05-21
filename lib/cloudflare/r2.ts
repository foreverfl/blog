const R2_BASE = process.env.NEXT_PUBLIC_R2_URI;

if (!R2_BASE) {
  throw new Error("❌ NEXT_PUBLIC_R2_URI is not defined");
}

type R2Params = {
  bucket: string;
  key: string;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Retry ${i + 1}/${retries} failed:`, err instanceof Error ? err.message : String(err));
      if (i < retries - 1) {
        await delay(delayMs);
      }
    }
  }
  console.error("❌ All retries failed.");
  throw lastError;
}

function getContentTypeFromExtension(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "json":
      return "application/json";
    case "txt":
      return "text/plain";
    case "html":
      return "text/html";
    case "csv":
      return "text/csv";
    case "md":
      return "text/markdown";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function putToR2({ bucket, key }: R2Params, data: any) {
  const contentType = getContentTypeFromExtension(key);

  let body: BodyInit;

  if (
    typeof data === "string" ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof Uint8Array
  ) {
    body = data;
  } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
    body = data;
  } else {
    body = JSON.stringify(data);
  }

  const now = Date.now();
  const url = `${R2_BASE}/${bucket}/${key}?t=${now}`;
  console.log(`📤 [R2 PUT] Uploading: ${key} (${contentType})`);
  
  await retry(async () => {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body,
    });
    if (!res.ok) throw new Error(`❌ Failed to PUT to R2: ${res.statusText}`);
  });
}

export async function getFromR2({ bucket, key }: R2Params) {
  const now = Date.now();
  const url = `${R2_BASE}/${bucket}/${key}?t=${now}`;

  return retry(async () => {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`❌ Failed to GET from R2: ${res.statusText}`);
    return res.json();
  });
}

export async function deleteFromR2({ bucket, key }: R2Params) {
  const url = `${R2_BASE}/${bucket}/${key}`;

  await retry(async () => {
    const res = await fetch(url, {
      method: "DELETE",
    });
    if (!res.ok)
      throw new Error(`❌ Failed to DELETE from R2: ${res.statusText}`);
  });
}
