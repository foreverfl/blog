// lib/api/googleIndexing.ts

import { google } from "googleapis";
import path from "path";
import { getApiCount, incrementApiCount } from "../postgres/api-usage";
import { logMessage } from "../logger";

const KEYFILEPATH = path.join(process.cwd(), "key.json");
const SCOPES = ["https://www.googleapis.com/auth/indexing"];
const maxDailyQuota = 200;
const apiName = "google_indexing";

export async function requestGoogleIndexing(
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED",
) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const currentCount = await getApiCount(apiName);
  logMessage(
    `Current API usage for ${apiName}: ${currentCount} requests today`,
  );

  if (currentCount >= maxDailyQuota) {
    return {
      ok: false,
      error: `Daily quota (${maxDailyQuota} requests) exceeded`,
      currentCount,
      quotaExceeded: true,
    };
  }

  await incrementApiCount(apiName);

  const indexing = google.indexing({ version: "v3", auth });

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });
    return { ok: true, data: response.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
