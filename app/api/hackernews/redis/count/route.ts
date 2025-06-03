import { getRedis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { ok: false, error: "Redis Connection Failed" },
      { status: 500 },
    );
  }

  try {
    const keys = await redis.keys("*");
    return NextResponse.json({ ok: true, keyCount: keys.length, keys });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
