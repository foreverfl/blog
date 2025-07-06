import { upsertAnimeBulk } from "@/lib/postgres/anime";
import { NextRequest, NextResponse } from "next/server";

const seasonMap = {
  winter: 1,
  spring: 2,
  summer: 3,
  fall: 4,
};

interface JellyfinView {
  Id: string;
  Name: string;
  [key: string]: any;
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const season = body.season?.toLowerCase();
    const seasonYear = Number(body.seasonYear);

    if (!season || !seasonYear) {
      return NextResponse.json(
        { error: "Missing season or seasonYear" },
        { status: 400 },
      );
    }

    const seasonNum = seasonMap[season as keyof typeof seasonMap];
    if (!seasonNum) {
      return NextResponse.json({ error: "Invalid season" }, { status: 500 });
    }

    // fetch Jellyfin views (all libraries)
    const views = await fetchJellyfinViews();

    const targetLibrary = views.find(
      (view: JellyfinView) => view.Name === `${seasonYear}-${seasonNum}`,
    );

    if (!targetLibrary) {
      return NextResponse.json({ error: "Library not found" }, { status: 500 });
    }

    // fetch series items in library
    const seriesItems = await fetchSeriesInLibrary(targetLibrary.Id);

    // check for missing Anilist IDs
    const itemsWithNoAnilistId = seriesItems.filter(
      (item: any) => !item.ProviderIds?.AniList,
    );

    if (itemsWithNoAnilistId.length > 0) {
      return NextResponse.json(
        {
          error: "Some animes have no Anilist ID.",
          data: itemsWithNoAnilistId.map((item: any) => ({
            id: item.Id,
            name: item.Name,
          })),
        },
        { status: 500 },
      );
    }

    const aniListIds = seriesItems.map((item: any) =>
      Number(item.ProviderIds.AniList),
    );

    const aniListData = await fetchAniListByIds(aniListIds);
    await upsertAnimeBulk(aniListData);

    return NextResponse.json({ message: "Sync complete" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

async function fetchJellyfinViews() {
  const res = await fetch(`${process.env.JELLYFIN_URL}/Items`, {
    headers: {
      Authorization: `MediaBrowser Token="${process.env.JELLYFIN_TOKEN}"`,
    },
  });
  const data = await res.json();
  return data.Items || [];
}

async function fetchSeriesInLibrary(parentId: string) {
  const res = await fetch(
    `${process.env.JELLYFIN_URL}/Users/${process.env.JELLYFIN_USER_ID}/Items?ParentId=${parentId}&Recursive=true&IncludeItemTypes=Series&fields=ProviderIds,UserData`,
    {
      headers: {
        Authorization: `MediaBrowser Token="${process.env.JELLYFIN_TOKEN}"`,
      },
    },
  );
  const data = await res.json();
  return data.Items || [];
}
/**
 * Fetch anime details from AniList by a list of IDs.
 * @param ids - An array of AniList IDs.
 * @returns AniList anime objects array.
 */
async function fetchAniListByIds(ids: number[]) {
  if (!ids.length) return [];

  const query = `
    query ($ids: [Int]) {
      Page(perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          id
          title { romaji english native }
          startDate { year month day }
          endDate { year month day }
          coverImage { color extraLarge }
          bannerImage
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
                title { romaji english native }
                startDate { year month day }
                coverImage { extraLarge }
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { ids } }),
  });
  const data = await res.json();
  return data?.data?.Page?.media ?? [];
}