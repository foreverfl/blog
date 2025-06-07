import { NextRequest, NextResponse } from "next/server";
import { getApiCount } from "@/lib/postgres/api-usage";
import { checkBearerAuth } from "@/lib/auth";

const apiName = "google_indexing";
const maxDailyQuota = 200;

export async function GET(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  const used = await getApiCount(apiName);
  const remaining = Math.max(0, maxDailyQuota - used);

  return NextResponse.json({
    ok: true,
    apiName,
    used,
    remaining,
    maxDailyQuota,
  });
}
