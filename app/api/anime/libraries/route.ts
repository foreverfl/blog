import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.JELLYFIN_URL}/Items`, {
      headers: {
        Authorization: `MediaBrowser Token="${process.env.JELLYFIN_TOKEN}"`,
      },
    });
    const data = await res.json();

    const pattern = /^\d{4}-[1-4]$/;
    const libraries = (data.Items || [])
      .filter((item: any) => pattern.test(item.Name))
      .map((item: any) => item.Name)
      .sort()
      .reverse();
    console.log("Filtered libraries: ", libraries);

    return NextResponse.json({ libraries });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch Jellyfin views" },
      { status: 500 },
    );
  }
}
