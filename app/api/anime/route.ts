import {
  getAnimesBySeason
} from "@/lib/postgres/anime";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");
    const seasonYear = Number(searchParams.get("seasonYear"));
    const page = Number(searchParams.get("page") ?? 1);
    const perPage = Number(searchParams.get("perPage") ?? 20);

    if (!season || !seasonYear) {
      return NextResponse.json(
        { error: "Missing season or seasonYear" },
        { status: 400 },
      );
    }
    const offset = (page - 1) * perPage;

    const animes = await getAnimesBySeason(
      season.toUpperCase(),
      seasonYear,
      offset,
      perPage,
    );

    return NextResponse.json({ animes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data from DB" },
      { status: 500 },
    );
  }
}


