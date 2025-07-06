import { Anime } from "@/types/anime";
import { pool } from "@/lib/postgres/connect";

export async function upsertAnime(anime: Anime, review: string = "") {
  const startDate = anime.startDate?.year
    ? `${anime.startDate.year}-${anime.startDate.month ?? 1}-${anime.startDate.day ?? 1}`
    : null;
  const endDate = anime.endDate?.year
    ? `${anime.endDate.year}-${anime.endDate.month ?? 1}-${anime.endDate.day ?? 1}`
    : null;

  const animeRelations = anime.relations?.edges
    ? anime.relations.edges
        .filter((edge) => edge.node.type === "ANIME")
        .map((edge) => ({
          id: edge.node.id,
          relationType: edge.relationType,
          title: {
            romaji: edge.node.title.romaji,
            english: edge.node.title.english,
            japanese: edge.node.title.native,
          },
          startDate: edge.node.startDate,
          coverImage: edge.node.coverImage.extraLarge,
          season: anime.season,
          seasonYear: anime.seasonYear,
        }))
    : [];

  const seasonsInfo = JSON.stringify(animeRelations);

  const query = `
    INSERT INTO public.anime (
      id, romaji_title, english_title, japanese_title, start_date, end_date, episodes, cover_color, cover_image_url,
      review, seasons_info, season, season_year, is_visible, updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      romaji_title = EXCLUDED.romaji_title,
      english_title = EXCLUDED.english_title,
      japanese_title = EXCLUDED.japanese_title,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      episodes = EXCLUDED.episodes,
      cover_color = EXCLUDED.cover_color,
      cover_image_url = EXCLUDED.cover_image_url,
      review = EXCLUDED.review,
      seasons_info = EXCLUDED.seasons_info,
      season = EXCLUDED.season,
      season_year = EXCLUDED.season_year,
      is_visible = EXCLUDED.is_visible,
      updated_at = CURRENT_TIMESTAMP;
  `;

  const values = [
    anime.id,
    anime.title.romaji,
    anime.title.english,
    anime.title.native,
    startDate,
    endDate,
    anime.episodes,
    anime.coverImage.color,
    anime.coverImage.extraLarge,
    review,
    seasonsInfo,
    anime.season,
    anime.seasonYear,
    true,
  ];

  await pool.query(query, values);
}

export async function insertAnimeBulkIfNotExist(animes: Anime[]) {
  if (animes.length === 0) return;

  const values: any[] = [];
  const placeholders: string[] = [];

  animes.forEach((anime, idx) => {
    const startDate = anime.startDate?.year
      ? `${anime.startDate.year}-${anime.startDate.month ?? 1}-${anime.startDate.day ?? 1}`
      : null;
    const endDate = anime.endDate?.year
      ? `${anime.endDate.year}-${anime.endDate.month ?? 1}-${anime.endDate.day ?? 1}`
      : null;

    const animeRelations = anime.relations?.edges
      ? anime.relations.edges
          .filter((edge) => edge.node.type === "ANIME")
          .map((edge) => ({
            id: edge.node.id,
            relationType: edge.relationType,
            title: {
              romaji: edge.node.title.romaji,
              english: edge.node.title.english,
              japanese: edge.node.title.native,
            },
            startDate: edge.node.startDate,
            coverImage: edge.node.coverImage.extraLarge,
            season: anime.season,
            seasonYear: anime.seasonYear,
          }))
      : [];

    const baseIdx = idx * 14;

    placeholders.push(`(
      $${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5},
      $${baseIdx + 6}, $${baseIdx + 7}, $${baseIdx + 8}, $${baseIdx + 9}, $${baseIdx + 10},
      $${baseIdx + 11}, $${baseIdx + 12}, $${baseIdx + 13}, $${baseIdx + 14}, CURRENT_TIMESTAMP
    )`);

    values.push(
      anime.id,
      anime.title.romaji,
      anime.title.english,
      anime.title.native,
      startDate,
      endDate,
      anime.episodes,
      anime.coverImage.color,
      anime.coverImage.extraLarge,
      "",
      JSON.stringify(animeRelations),
      anime.season,
      anime.seasonYear,
      true,
    );
  });

  const query = `
    INSERT INTO public.anime (
      id, romaji_title, english_title, japanese_title,
      start_date, end_date, episodes, cover_color, cover_image_url,
      review, seasons_info, season, season_year, is_visible, updated_at
    )
    VALUES
    ${placeholders.join(", ")}
    ON CONFLICT (id) DO NOTHING;
  `;

  await pool.query(query, values);
}

export async function upsertAnimeBulk(animes: Anime[]) {
  if (animes.length === 0) return;

  const values: any[] = [];
  const placeholders: string[] = [];

  animes.forEach((anime, idx) => {
    const startDate = anime.startDate?.year
      ? `${anime.startDate.year}-${anime.startDate.month ?? 1}-${anime.startDate.day ?? 1}`
      : null;
    const endDate = anime.endDate?.year
      ? `${anime.endDate.year}-${anime.endDate.month ?? 1}-${anime.endDate.day ?? 1}`
      : null;

    const animeRelations = anime.relations?.edges
      ? anime.relations.edges
          .filter((edge) => edge.node.type === "ANIME")
          .map((edge) => ({
            id: edge.node.id,
            relationType: edge.relationType,
            title: {
              romaji: edge.node.title.romaji,
              english: edge.node.title.english,
              japanese: edge.node.title.native,
            },
            startDate: edge.node.startDate,
            coverImage: edge.node.coverImage.extraLarge,
            season: anime.season,
            seasonYear: anime.seasonYear,
          }))
      : [];

    const baseIdx = idx * 14;

    placeholders.push(`(
      $${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5},
      $${baseIdx + 6}, $${baseIdx + 7}, $${baseIdx + 8}, $${baseIdx + 9}, $${baseIdx + 10},
      $${baseIdx + 11}, $${baseIdx + 12}, $${baseIdx + 13}, $${baseIdx + 14}, CURRENT_TIMESTAMP
    )`);

    values.push(
      anime.id,
      anime.title.romaji,
      anime.title.english,
      anime.title.native,
      startDate,
      endDate,
      anime.episodes,
      anime.coverImage.color,
      anime.coverImage.extraLarge,
      "",
      JSON.stringify(animeRelations),
      anime.season,
      anime.seasonYear,
      anime.isVisible ?? true,
    );
  });

  const query = `
    INSERT INTO public.anime (
      id, romaji_title, english_title, japanese_title,
      start_date, end_date, episodes, cover_color, cover_image_url,
      review, seasons_info, season, season_year, is_visible, updated_at
    )
    VALUES
    ${placeholders.join(", ")}
    ON CONFLICT (id) DO UPDATE SET
      romaji_title = EXCLUDED.romaji_title,
      english_title = EXCLUDED.english_title,
      japanese_title = EXCLUDED.japanese_title,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      episodes = EXCLUDED.episodes,
      cover_color = EXCLUDED.cover_color,
      cover_image_url = EXCLUDED.cover_image_url,
      review = EXCLUDED.review,
      seasons_info = EXCLUDED.seasons_info,
      season = EXCLUDED.season,
      season_year = EXCLUDED.season_year,
      is_visible = EXCLUDED.is_visible,
      updated_at = CURRENT_TIMESTAMP;
  `;

  await pool.query(query, values);
}

export async function updateAnimesInvisibleBySeason(
  season: string,
  seasonYear: number,
) {
  const query = `
    UPDATE public.anime
    SET is_visible = false
    WHERE season = $1
      AND season_year = $2;
  `;
  await pool.query(query, [season, seasonYear]);
}

export async function getAnimesBySeason(
  season: string,
  seasonYear: number,
  offset = 0,
  limit = 20,
) {
  const query = `
    SELECT *
    FROM public.anime
    WHERE season = $1
      AND season_year = $2
      AND is_visible = true
    ORDER BY start_date DESC
    OFFSET $3
    LIMIT $4;
  `;
  const res = await pool.query(query, [season, seasonYear, offset, limit]);
  return res.rows;
}

export async function deleteAnime(id: number) {
  const query = `
    DELETE FROM public.anime
    WHERE id = $1;
  `;
  await pool.query(query, [id]);
}
