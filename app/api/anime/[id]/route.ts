import { upsertAnime } from "@/lib/postgres/anime";
import { pool } from "@/lib/postgres/connect";
import {
  dbRowToAnime,
  type Anime,
  type AnimeDate,
  type AnimeDbRow,
} from "@/types/anime";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const animeId = Number(id);
    if (!animeId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await req.json();

    // existing data
    const { rows } = await pool.query(
      "SELECT * FROM public.anime WHERE id = $1",
      [id],
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }
    const prevDbRow: AnimeDbRow = rows[0];
    const prevAnime = dbRowToAnime(prevDbRow);
    // new data by PATCH

    const updated: Anime = {
      ...prevAnime,
      ...body,
      id: animeId,
    };

    // upsert the anime to Postgres
    await upsertAnime(updated, body.review ?? prevAnime.review);

    return NextResponse.json({ message: "Anime updated", anime: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
