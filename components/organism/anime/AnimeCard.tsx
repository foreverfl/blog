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
}

const AnimeCard: React.FC<AnimeCardProps> = (props) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        src={props.cover_image_url}
        alt={props.romaji_title}
        width={400}
        height={600}
        className="w-full object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold">{props.romaji_title}</h2>
        <p className="text-sm text-gray-600">{props.english_title || "-"}</p>
        <p className="text-sm text-gray-600">{props.japanese_title}</p>
        <p className="text-sm text-gray-500">Episodes: {props.episodes}</p>
        <p className="text-xs text-gray-400">
          {new Date(props.start_date).toLocaleDateString()} ~{" "}
          {new Date(props.end_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default AnimeCard;
