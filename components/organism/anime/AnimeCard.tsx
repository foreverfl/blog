"use client";

import Image from "next/image";
import React from "react";

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

interface AnimeCardProps {
  id: number;
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
  isEditMode?: boolean;
  onToggleVisibility?: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = (props) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {props.isEditMode && (
        <input
          type="checkbox"
          checked={props.is_visible}
          onChange={props.onToggleVisibility}
          className="absolute top-2 right-2 w-5 h-5 bg-red-500 border-2 border-black z-50"
        />
      )}
      <div className="relative w-full h-[400px]">
        <Image
          src={props.cover_image_url}
          alt={props.romaji_title}
          fill
          className="object-cover object-center"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-500">
          {props.japanese_title}
        </h2>
      </div>
    </div>
  );
};

export default AnimeCard;
