import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lan: string }> },
) {
  const { lan } = await context.params;

  if (!["en", "ja", "ko"].includes(lan)) {
    return NextResponse.json(
      { success: false, message: "Invalid language parameter" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("lan", lan);
  return response;
}
