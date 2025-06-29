import type { Anime, AnimeDate, AnimePage } from "@/types/anime"; // 👈 types 폴더에 따로 두면 좋아요
import { gql, request } from "graphql-request";
import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";

const limit = pLimit(10); // Concurrency limit for requests

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
        episodes
        coverImage {
          color
          extraLarge
        }
        endDate {
          year
          month
          day
        }
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

function formatDate(dateObj: AnimeDate): string | null {
  if (!dateObj?.year) return null;

  const year = dateObj.year;
  const month = dateObj.month ?? 1;
  const day = dateObj.day ?? 1;

  // YYYY-MM-DD
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const season = searchParams.get("season")?.toUpperCase() as string;
    const seasonYear = Number(searchParams.get("seasonYear"));

    let animeResults: Anime[] = [];

    if (season && seasonYear) {
      const data: AnimePage = await request(API_URL, ANIME_QUERY, {
        season,
        seasonYear,
      });
      animeResults = data.Page.media;
    } else {
      const years = [2021, 2022, 2023, 2024, 2025];
      const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];

      const limitedPromises = years.flatMap((year) =>
        seasons.map((season) =>
          limit(() =>
            request<AnimePage>(API_URL, ANIME_QUERY, {
              season,
              seasonYear: year,
            }),
          ),
        ),
      );

      const results = await Promise.all(limitedPromises);

      animeResults = results.flatMap((r) => r.Page.media);
    }

    const animes = animeResults.map((anime: Anime) => {
      const relatedAnime = anime.relations.edges
        .filter((edge) => edge.node.type === "ANIME")
        .sort((a, b) => {
          const aDate = new Date(
            a.node.startDate.year ?? 0,
            (a.node.startDate.month ?? 1) - 1,
            a.node.startDate.day ?? 1,
          );
          const bDate = new Date(
            b.node.startDate.year ?? 0,
            (b.node.startDate.month ?? 1) - 1,
            b.node.startDate.day ?? 1,
          );
          return aDate.getTime() - bDate.getTime();
        })
        .map((edge) => {
          const { startDate, ...restNode } = edge.node;

          return {
            ...edge,
            node: {
              ...restNode,
              startDateFormatted: formatDate(startDate),
            },
          };
        });

      const startDateFormatted = formatDate(anime.startDate);
      const endDateFormatted = formatDate(anime.endDate);

      return {
        id: anime.id,
        title: anime.title,
        episodes: anime.episodes,
        coverImage: anime.coverImage,
        relations: {
          edges: relatedAnime,
        },
        startDateFormatted,
        endDateFormatted,
      };
    });

    return NextResponse.json({ animes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
