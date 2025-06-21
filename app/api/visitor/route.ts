import { upsertVisitorFingerprint } from "@/lib/postgres/fingerprint";
import { NextRequest, NextResponse } from "next/server";

function isBotUserAgent(ua: string) {
  if (!ua) return false;
  return /bot|spider|crawl|slurp|duckduckgo|bingpreview|yeti|baiduspider|sogou|facebook|whatsapp|telegram|line|twitter|pinterest|yandex|semrush|ahrefs|mj12bot|seekport|uptime|datanyze|curl|wget|python-requests|axios|okhttp|scrapy|gpt|openai|chatgpt|llama|anthropic|claude|bard|google-extended|applebot|snapchat|discord|discordbot|linkedin|baidu|sitechecker|linkedinbot|redditbot|headless|phantomjs|selenium|chrome-lighthouse|pagespeed|statuscake|github-copilot|cloudflare|petalbot|coccoc|nimbostratus|archive\.org|wayback/i.test(
    ua,
  );
}

export async function POST(req: NextRequest) {
  const { fingerprint } = await req.json();
  const userAgent = req.headers.get("user-agent") || "";
  const ipAddress =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  const country = req.headers.get("cf-ipcountry") || null;

  const isBot = isBotUserAgent(userAgent);

  await upsertVisitorFingerprint(
    fingerprint,
    userAgent,
    ipAddress,
    country,
    isBot,
  );

  return NextResponse.json({ ok: true });
}
