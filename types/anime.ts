export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string;
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
