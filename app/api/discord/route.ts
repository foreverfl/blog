import { getCurrentTimeKST } from "@/lib/date";
import { NextRequest, NextResponse } from "next/server";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID!;
const rateLimitMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    // tmp code: prevent abuse
    const now = Date.now();
    const forwarded_tmp = req.headers.get("x-forwarded-for");
    const ip_tmp = forwarded_tmp ? forwarded_tmp.split(",")[0] : "unknown";
    const last = rateLimitMap.get(ip_tmp) ?? 0;
    if (now - last < 10000) {
      return NextResponse.json(
        { ok: false, error: "Too Many Requests" },
        { status: 429 },
      );
    }
    rateLimitMap.set(ip_tmp, now);

    const payload = await req.json();

    if (!payload.type) {
      return NextResponse.json(
        { ok: false, error: "Missing payload.type" },
        { status: 400 },
      );
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // 1. create message content based on type
    let discordContent = "====================\n";
    discordContent += `[${getCurrentTimeKST()}] [IP]: ${ip}\n`; // log the IP address with timestamp
    if (payload.type === "bug_report") {
      discordContent += "**🐞 Bug Report**";
      const { title, content } = payload;
      if (!title || !content) {
        return NextResponse.json(
          { ok: false, error: "Missing title or content" },
          { status: 400 },
        );
      }
      discordContent += `\n\n[Title]\n${title}`;
      discordContent += `\n\n[Content]\n${content}`;
    } else if (payload.type === "comment") {
      const { message } = payload;
      if (!message) {
        return NextResponse.json(
          { ok: false, error: "Missing message" },
          { status: 400 },
        );
      }
      discordContent += `\n\n💬 **New Comment:**\n${message}`;
    } else {
      return NextResponse.json(
        { ok: false, error: `Unknown type: ${payload.type}` },
        { status: 400 },
      );
    }
    discordContent += "\n====================\n";

    // 2. create DM channel with the user
    const dmChannelRes = await fetch(
      "https://discord.com/api/v10/users/@me/channels",
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: DISCORD_USER_ID }),
      },
    );

    if (!dmChannelRes.ok) {
      const errorText = await dmChannelRes.text();
      throw new Error("Failed to create DM channel: " + errorText);
    }
    const dmChannelData = await dmChannelRes.json();
    const channelId = dmChannelData.id;

    // 3. send the message to the DM channel
    const messageRes = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: discordContent }),
      },
    );

    if (!messageRes.ok) {
      const errorText = await messageRes.text();
      console.error("Failed to send message:", errorText);
      throw new Error("Failed to send message: " + errorText);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as any).message },
      { status: 500 },
    );
  }
}
