import { upsertAnimeBulk } from "@/lib/postgres/anime";
import { NextRequest, NextResponse } from "next/server";

const seasonMap = {
  winter: 1,
  spring: 2,
  summer: 3,
  fall: 4,
};

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
      return NextResponse.json({ error: "Invalid season" }, { status: 400 });
    }

    // fetch Jellyfin views (all libraries)
    const views = await fetchJellyfinViews();

    interface JellyfinView {
      Id: string;
      Name: string;
      [key: string]: any;
    }

    const targetLibrary = views.find(
      (view: JellyfinView) => view.Name === `${seasonYear}-${seasonNum}`,
    );

    if (!targetLibrary) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    // fetch series items in library
    const seriesItems = await fetchSeriesInLibrary(targetLibrary.Id);

    const mapped = seriesItems.map((item: any) => ({
      id: item.Id,
      name: item.Name,
      year: item.ProductionYear,
      anilistId: item.ProviderIds?.AniList
        ? Number(item.ProviderIds.AniList)
        : null,
      unplayedItemCount: item.UserData?.UnplayedItemCount ?? 0,
    }));

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
        { status: 400 },
      );
    }

    // synchronize Anilist data
    const preparedAnimes = seriesItems.map((item: any) => ({
      id: Number(item.ProviderIds.AniList),
      title: {
        romaji: item.Name,
        english: item.SortName ?? item.Name,
        japanese: item.Name,
      },
      startDate: null,
      endDate: null,
      episodes: item.ChildCount,
      coverImage: {
        color: null,
        extraLarge: null,
      },
      relations: [],
      season,
      seasonYear,
    }));

    await upsertAnimeBulk(preparedAnimes);

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
