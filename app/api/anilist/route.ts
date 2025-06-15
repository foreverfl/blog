import { NextResponse } from "next/server";
import { request, gql } from "graphql-request";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const season = (searchParams.get("season") ?? "WINTER").toUpperCase();
  const seasonYear = Number(searchParams.get("seasonYear") ?? 2025);

  const query = gql`
    query ($season: MediaSeason, $seasonYear: Int) {
      Page(perPage: 100) {
        media(
          type: ANIME
          sort: POPULARITY_DESC
          season: $season
          seasonYear: $seasonYear
        ) {
          id
          title {
            romaji
            native
          }
          coverImage {
            large
          }
          season
          seasonYear
        }
      }
    }
  `;

  const variables = { season, seasonYear };

  const data = await request(ANILIST_ENDPOINT, query, variables);

  return NextResponse.json(data, { status: 200 });
}
