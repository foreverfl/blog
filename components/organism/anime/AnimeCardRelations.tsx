"use client";

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

interface AnimeCardRelationsProps {
  relations: SeasonInfo[];
  refreshList?: (year?: number, season?: string) => void;
}

const AnimeCardRelations: React.FC<AnimeCardRelationsProps> = (props) => {
  const { relations, refreshList } = props;
  if (!relations || relations.length === 0) return null;

  return (
    <div
      className="
            absolute left-1/2 top-1/2 z-30
            translate-x-1/4 translate-y-1/4
            bg-gray-800 text-white text-xs px-4 py-2 rounded opacity-0 pointer-events-none
            group-hover:opacity-100 group-hover:pointer-events-auto transition max-h-40 overflow-auto
            shadow-lg whitespace-nowrap
        "
    >
      <div className="font-bold mb-1">Related Works</div>
      {relations.map((s) => {
        const showSeason = s.seasonYear && s.season;
        return (
          <div key={s.id} className="whitespace-nowrap">
            <span
              className="underline cursor-pointer"
              onClick={() => {
                refreshList?.(s.seasonYear, s.season);
              }}
            >
              {showSeason ? `[${s.seasonYear} ${s.season}] ` : ""}
              {s.title.japanese}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AnimeCardRelations;
