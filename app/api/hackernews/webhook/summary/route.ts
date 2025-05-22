import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { classification, id, date } = body;

  if (classification === "en" && id) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/hackernews/polling`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classification, id, date }),
        }
      );
    } catch (error) {
      console.error("❌ Failed to trigger polling:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
