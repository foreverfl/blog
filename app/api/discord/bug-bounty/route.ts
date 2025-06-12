import { NextRequest, NextResponse } from "next/server";

// Discord 웹훅 URL (본인 디스코드 채널 웹훅)
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    console.log("Received data:", { title, content });

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: "No content" },
        { status: 400 },
      );
    }

    // Discord webhook 메시지 포맷
    const payload = {
      embeds: [
        {
          title: `Bug Report: ${title}`,
          description: content,
          color: 16724787, // red
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Webhook으로 전송
    const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      throw new Error("Discord webhook failed");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as any).message },
      { status: 500 },
    );
  }
}
