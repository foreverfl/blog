// type for graphql-request
export interface AniListTitle {
  romaji: string;
  english: string | null;
  native: string;
}

export interface AniListAnime {
  id: number;
  title: AniListTitle;
  startDate: AnimeDate;
  endDate: AnimeDate;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  coverImage: AnimeCoverImage;
  relations: {
    edges: RelationEdge[];
  };
}

export interface AniListAnimePage {
  Page: {
    media: any[];
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
  };
}

// types for database operations
export interface AnimeTitle {
  [x: string]: any;
  romaji: string;
  english: string | null;
  japanese: string;
}

export interface AnimeDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AnimeCoverImage {
  color: string | null;
  extraLarge: string;
}

export interface RelatedAnimeNode {
  id: number;
  type: string;
  title: AnimeTitle;
  startDate: AnimeDate;
  coverImage: AnimeCoverImage;
}

export interface RelationEdge {
  relationType: string;
  node: RelatedAnimeNode;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  startDate: AnimeDate;
  endDate: AnimeDate;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  coverImage: AnimeCoverImage;
  relations: {
    edges: RelationEdge[];
  };
}

export interface AnimePage {
  Page: {
    media: Anime[];
  };
}
