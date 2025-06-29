"use client";

import AnimeCard from "@/components/organism/anime/AnimeCard";
import { useCallback, useEffect, useRef, useState } from "react";

interface SeasonInfo {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    japanese: string;
  };
  season: string;
  startDate: {
    day: number | null;
    month: number | null;
    year: number | null;
  };
  coverImage: string;
  seasonYear: number;
  relationType: string;
}

interface AnimeItem {
  id: string;
  romaji_title: string;
  english_title: string;
  japanese_title: string;
  korean_title: string;
  start_date: string;
  end_date: string;
  episodes: number;
  cover_color: string;
  cover_image_url: string;
  review: string;
  seasons_info: SeasonInfo[];
  updated_at: string;
  season: string;
  season_year: number;
  is_visible: boolean;
}

// Generate years from 1970 to current year
const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1970 + 1 },
  (_, i) => 1970 + i,
);

const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];

const AnimeList = () => {
  const [animes, setAnimes] = useState<AnimeItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchAnimes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/anime?season=FALL&seasonYear=2024&page=${page}&perPage=20`,
      );
      const data = await res.json();

      if (data.animes.length === 0) {
        setHasMore(false);
      } else {
        setAnimes((prev) => {
          const newAnimes = data.animes.filter(
            (anime: AnimeItem) => !prev.some((a) => a.id === anime.id),
          );
          return [...prev, ...newAnimes];
        });
      }
    } catch (error) {
      console.error("Failed to fetch animes:", error);
    }
  }, [page]);

  const handleToggleVisibility = (id: string) => {
    setAnimes((prev) =>
      prev.map((anime) =>
        anime.id === id ? { ...anime, is_visible: !anime.is_visible } : anime,
      ),
    );
  };

  const displayedAnimes = isEditMode
    ? animes
    : animes.filter((a) => a.is_visible);

  useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 },
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore]);

  return (
    <>
      <div className="my-56"></div>

      {/* Header: Year and Season select, Edit button */}
      <div className="flex justify-between items-center my-10">
        {/* Year and Season Selects */}
        <div className="flex space-x-4">
          <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {years
              .slice()
              .reverse()
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
          <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season.charAt(0) + season.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Edit button */}
        <button
          onClick={() => setIsEditMode((prev) => !prev)}
          className="border border-blue-500 dark:border-blue-400 rounded px-4 py-1 bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isEditMode ? "Done" : "Edit"}
        </button>
      </div>

      {/* Anime Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedAnimes.map((anime) => (
          <AnimeCard
            key={anime.id}
            {...{ ...anime, id: Number(anime.id) }}
            isEditMode={isEditMode}
            onToggleVisibility={() => handleToggleVisibility(anime.id)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="text-center py-10 text-gray-500"></div>
      )}

      <div className="my-56"></div>
    </>
  );
};

export default AnimeList;
