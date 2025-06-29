"use client";

import AnimeCard from "@/components/organism/anime/AnimeCard";
import { useCallback, useEffect, useState } from "react";

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

  const fetchAnimes = useCallback(async () => {
    try {
      const res = await fetch(`/api/anime?season=FALL&seasonYear=2024`);
      const data = await res.json();
      setAnimes(data.animes);
    } catch (error) {
      console.error("Failed to fetch animes:", error);
    }
  }, []);

  useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} {...{ ...anime, id: Number(anime.id) }} />
      ))}
    </div>
  );
};

export default AnimeList;
