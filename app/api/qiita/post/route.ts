import { checkBearerAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
    if (authResult !== true) return authResult;

    const { title, body, tags } = await req.json();

    const res = await fetch("https://qiita.com/api/v2/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QIITA_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        title,
        body,
        tags: tags ?? [],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
