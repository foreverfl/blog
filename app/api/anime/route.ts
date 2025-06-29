import { checkBearerAuth } from "@/lib/auth";
import {
  deleteAnime,
  getAnimesBySeason,
  upsertAnimeBulk,
} from "@/lib/postgres/anime";
import type { AniListAnimePage } from "@/types/anime";
import { gql, request } from "graphql-request";
import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://graphql.anilist.co";

const ANIME_QUERY = gql`
  query ($season: MediaSeason, $seasonYear: Int) {
    Page(page: 1, perPage: 50) {
      media(season: $season, type: ANIME, seasonYear: $seasonYear) {
        id
        title {
          romaji
          english
          native
        }
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        coverImage {
          color
          extraLarge
        }
        season
        seasonYear
        episodes
        relations {
          edges {
            relationType
            node {
              id
              type
              title {
                romaji
                english
                native
              }
              startDate {
                year
                month
                day
              }
              coverImage {
                extraLarge
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season");
    const seasonYear = Number(searchParams.get("seasonYear"));

    if (!season || !seasonYear) {
      return NextResponse.json(
        { error: "Missing season or seasonYear" },
        { status: 400 },
      );
    }

    const animes = await getAnimesBySeason(season.toUpperCase(), seasonYear);
    return NextResponse.json({ animes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data from DB" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  try {
    const body = await req.json();
    const season = body.season?.toUpperCase() as string;
    const seasonYear = Number(body.seasonYear);

    if (!season || !seasonYear) {
      return NextResponse.json(
        { error: "Missing season or seasonYear" },
        { status: 400 },
      );
    }

    const data: AniListAnimePage  = await request(API_URL, ANIME_QUERY, {
      season,
      seasonYear,
    });

    const animeResults = data.Page.media;

    const animes = animeResults.map((anime) => {

      return {
        ...anime,
        title: {
          romaji: anime.title.romaji,
          english: anime.title.english,
          japanese: anime.title.native,
        }
      };
    });

    await upsertAnimeBulk(animes, "", "");

    return NextResponse.json({
      message: "Animes inserted/updated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch or insert data" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = checkBearerAuth(req, "HACKERNEWS_API_KEY");
  if (authResult !== true) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Missing anime id" }, { status: 400 });
    }

    await deleteAnime(id);
    return NextResponse.json({ message: `Anime with id ${id} deleted.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete anime" },
      { status: 500 },
    );
  }
}
