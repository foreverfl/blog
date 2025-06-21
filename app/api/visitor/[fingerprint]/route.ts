import { getVisitorByFingerprint } from "@/lib/postgres/fingerprint";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ fingerprint: string }>;
  },
) {
  const { fingerprint } = await params;
  if (!fingerprint) {
    return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
  }
  const data = await getVisitorByFingerprint(fingerprint);
  if (!data) {
    return NextResponse.json({ ok: false, found: false });
  }
  return NextResponse.json({ ok: true, found: true, data });
}
