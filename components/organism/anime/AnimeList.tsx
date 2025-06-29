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

const AnimeList = () => {
  const [animes, setAnimes] = useState<AnimeItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animes.map((anime) => (
          <AnimeCard key={anime.id} {...{ ...anime, id: Number(anime.id) }} />
        ))}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="text-center py-10 text-gray-500"></div>
      )}
    </>
  );
};

export default AnimeList;
