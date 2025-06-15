import { NextResponse } from "next/server";
import { request, gql } from "graphql-request";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export async function GET(req: Request) {
  const query = gql`
    query {
      GenreCollection
    }
  `;

  const data = await request(ANILIST_ENDPOINT, query);

  return NextResponse.json(data, { status: 200 });
}
