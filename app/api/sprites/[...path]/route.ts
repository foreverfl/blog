import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  // e.g. ["sprite@2x.json"] → "sprite-2x.json"
  const filename = path.join("/").replace("@2x", "-2x");
  const filePath = join(process.cwd(), "public", "sprites", filename);

  try {
    const data = await readFile(filePath);
    const ext = filename.split(".").pop();
    const contentType = ext === "json" ? "application/json" : "image/png";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
