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
  season: string | null;
  seasonYear: number | null;
  coverImage: AnimeCoverImage;
  relations: {
    edges: RelationEdge[];
  };
  isVisible?: boolean;
  review?: string;
}

export interface AnimeDbRow {
  id: number;
  romaji_title: string;
  english_title: string | null;
  japanese_title: string;
  start_date: string | null; // ISO string or null
  end_date: string | null;
  episodes: number | null;
  season: string | null;
  season_year: number | null;
  cover_image_url: string;
  cover_image_color: string | null;
  relations: any; // JSONB
  is_visible?: boolean;
  review?: string;
}

export interface AnimePage {
  Page: {
    media: Anime[];
  };
}

export function dbRowToAnime(row: AnimeDbRow): Anime {
  const parseDate = (dateStr: string | null): AnimeDate => {
    if (!dateStr) return { year: null, month: null, day: null };

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { year: null, month: null, day: null };
    }

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 'cause 0-based, +1
      day: date.getDate(),
    };
  };

  return {
    id: row.id,
    title: {
      romaji: row.romaji_title,
      english: row.english_title,
      native: row.japanese_title,
    },
    startDate: parseDate(row.start_date),
    endDate: parseDate(row.end_date),
    episodes: row.episodes,
    season: row.season,
    seasonYear: row.season_year,
    coverImage: {
      extraLarge: row.cover_image_url,
      color: row.cover_image_color,
    },
    relations: row.relations || { edges: [] },
    isVisible: row.is_visible,
    review: row.review,
  };
}

export function animeToDbRow(anime: Anime): Partial<AnimeDbRow> {
  return {
    id: anime.id,
    romaji_title: anime.title.romaji,
    english_title: anime.title.english,
    japanese_title: anime.title.native,
    start_date: JSON.stringify(anime.startDate),
    end_date: JSON.stringify(anime.endDate),
    episodes: anime.episodes,
    season: anime.season,
    season_year: anime.seasonYear,
    cover_image_url: anime.coverImage.extraLarge,
    cover_image_color: anime.coverImage.color,
    relations: anime.relations,
    is_visible: anime.isVisible,
    review: anime.review,
  };
}
