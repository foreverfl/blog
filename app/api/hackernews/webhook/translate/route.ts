import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, language, date } = await req.json();

  if (!id || !language) {
    return NextResponse.json({ ok: false, error: "Missing id or language" });
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hackernews/polling/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, language, date }),
    });
  } catch (err) {
    console.error("❌ Failed to trigger translation polling:", err);
  }

  return NextResponse.json({ ok: true });
}