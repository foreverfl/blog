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
  console.log("AnimeCard props:", props);
  const handleCardClick = async () => {
    const input = window.prompt(
      "Write your review. (Leave blank to remove)\n\n기존 내용: " +
        (props.review ?? ""),
    );
    if (input === null) return;

    try {
      // PATCH request to update review
      const res = await fetch(`/api/anime/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: input }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Failed to update review: " + (data?.error || "Unknown error"));
        return;
      }
      alert("Review updated!");
    } catch (err) {
      alert("Network error.");
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border-1"
      style={{ borderColor: props.cover_color || "#ccc" }}
    >
      <div className="relative w-full h-[400px]">
        <Image
          src={props.cover_image_url}
          alt={props.romaji_title}
          fill
          sizes="(max-width: 768px) 100vw, 
         (max-width: 1200px) 50vw, 
         25vw"
          className="object-cover object-center cursor-pointer"
          onClick={handleCardClick}
          title="Click to edit review"
        />
      </div>
      <div className="p-4 flex-grow">
        <h2 className="text-lg font-bold text-gray-500 line-clamp-2">
          {props.japanese_title}
        </h2>
        {props.review && (
          <p className="text-gray-700 text-sm mt-2 line-clamp-2">
            {props.review}
          </p>
        )}
      </div>
    </div>
  );
};

export default AnimeCard;
