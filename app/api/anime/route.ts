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
  query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
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
        isAdult
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

    let currentPage = 1;
    let hasNextPage = true;
    let allAnimeResults: any[] = [];

    while (hasNextPage) {
      const data: AniListAnimePage = await request(API_URL, ANIME_QUERY, {
        season,
        seasonYear,
        page: currentPage,
        perPage: 50,
      });

      const animeResults = data.Page.media.filter((anime) => !anime.isAdult);

      allAnimeResults = allAnimeResults.concat(animeResults);

      const pageInfo = data.Page.pageInfo;
      hasNextPage = pageInfo.hasNextPage;
      currentPage++;
    }

    const animes = allAnimeResults.map((anime) => {
      return {
        ...anime,
        title: {
          romaji: anime.title.romaji,
          english: anime.title.english,
          japanese: anime.title.native,
        },
      };
    });

    await upsertAnimeBulk(animes);

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
