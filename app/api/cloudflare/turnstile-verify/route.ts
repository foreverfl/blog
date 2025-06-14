import { logMessage } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { turnstileToken } = await req.json();
    if (!turnstileToken) {
      return NextResponse.json(
        { ok: false, error: "No token" },
        { status: 400 },
      );
    }

    const secret = process.env.TURNSTILE_SECRET_KEY!;
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(turnstileToken)}`,
      },
    );

    const verifyData = await verifyRes.json();
    logMessage(`Turnstile verification: ${JSON.stringify(verifyData)}`);

    if (!verifyData.success) {
      return NextResponse.json(
        { ok: false, error: "Turnstile validation failed" },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as any).message },
      { status: 500 },
    );
  }
}
