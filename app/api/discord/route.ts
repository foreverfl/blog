import { getCurrentTimeKST } from "@/lib/date";
import { NextRequest, NextResponse } from "next/server";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID!;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { type, ...rest } = payload;

    if (!payload.type) {
      return NextResponse.json(
        { ok: false, error: "Missing payload.type" },
        { status: 400 },
      );
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    let discordContent = `[${getCurrentTimeKST()}] ${ip}\n`;

    // 1. create message content based on type
    if (type === "bug_report") {
      const { title, content } = rest;
      discordContent += `# Bug Report`;
      discordContent += `\n\n## Title\n${title}`;
      discordContent += `\n\n## Content\n${content}`;
    } else if (type === "comment_create") {
      const { content, username, post_url } = rest;
      discordContent += `# New Comment`;
      if (post_url) discordContent += `\n\n## Post\n${post_url}`;
      if (username) discordContent += `\n\n## User\n${username}`;
      if (content) discordContent += `\n\n## Content\n${content}`;
    } else {
      return NextResponse.json(
        { ok: false, error: `Unknown type: ${type}` },
        { status: 400 },
      );
    }

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
