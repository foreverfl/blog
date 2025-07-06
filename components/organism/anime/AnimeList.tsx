"use client";

import AnimeCard from "@/components/organism/anime/AnimeCard";
import {
  useLoadingDispatch,
  useLoadingState,
} from "@/lib/context/loading-context";
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

const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];

function numToSeason(num: string | number) {
  switch (String(num)) {
    case "1":
      return "WINTER";
    case "2":
      return "SPRING";
    case "3":
      return "SUMMER";
    case "4":
      return "FALL";
    default:
      return "";
  }
}

function seasonToNum(season: string) {
  switch (season.toUpperCase()) {
    case "WINTER":
      return "1";
    case "SPRING":
      return "2";
    case "SUMMER":
      return "3";
    case "FALL":
      return "4";
    default:
      return "";
  }
}

const AnimeList = () => {
  const dispatch = useLoadingDispatch();
  const { isLoading } = useLoadingState();

  const [libraryList, setLibraryList] = useState<
    { year: string; season: string }[]
  >([]);
  const [animes, setAnimes] = useState<AnimeItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedSeason, setSelectedSeason] = useState<string>();

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const yearOptions = Array.from(
    new Set(libraryList.map((item) => item.year)),
  ).sort((a, b) => Number(b) - Number(a));

  const availableSeasons = libraryList
    .filter((item) => item.year === String(selectedYear))
    .map((item) => numToSeason(item.season))
    .filter(Boolean);

  const fetchLibraries = useCallback(async () => {
    try {
      dispatch({ type: "START_LOADING" });
      const res = await fetch("/api/anime/libraries");
      const data = await res.json();

      if (data.libraries && data.libraries.length > 0) {
        const list = data.libraries.map((name: string) => {
          const [year, seasonNum] = name.split("-");
          return { year, season: seasonNum };
        });
        setLibraryList(list);

        const [latest] = list;
        setSelectedYear((prev) => prev ?? Number(latest.year));
        setSelectedSeason((prev) => prev ?? numToSeason(latest.season));
      }
    } catch (e) {
      console.error("Failed to fetch libraries", e);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  }, []);

  const fetchAnimes = useCallback(async () => {
    try {
      dispatch({ type: "START_LOADING" });
      const res = await fetch(
        `/api/anime?season=${selectedSeason}&seasonYear=${selectedYear}&page=${page}&perPage=20`,
      );
      const data = await res.json();

      if (!data.animes || data.animes.length === 0) {
        setHasMore(false);
        return;
      }

      setAnimes((prev) => {
        const newAnimes = data.animes.filter(
          (anime: AnimeItem) => !prev.some((a) => a.id === anime.id),
        );
        return [...prev, ...newAnimes];
      });
    } catch (error) {
      console.error("Failed to fetch animes:", error);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  }, [selectedSeason, selectedYear, page]);

  const handleSync = useCallback(async () => {
    try {
      dispatch({ type: "START_LOADING" });
      const res = await fetch(`/api/anime/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season: selectedSeason,
          seasonYear: selectedYear,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.data?.length > 0) {
          const names = data.data
            .map((item: any) => `• ${item.name}`)
            .join("\n");
          alert(`Some animes have no Anilist ID:\n\n${names}`);
        } else {
          alert("Sync failed: " + (data.error || "Unknown error"));
        }
        return;
      }

      alert("Sync complete!");

      setPage(1);
      setAnimes([]);
      setHasMore(true);
      await fetchAnimes();
    } catch (error) {
      console.error("Failed to sync:", error);
      alert("Sync failed due to network or server error.");
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  }, [selectedSeason, selectedYear, fetchAnimes]);


  /**
   * Resets the anime list state and optionally updates the selected year and season.
   *
   * @param year - (Optional) The year to set as the selected year.
   * @param season - (Optional) The season to set as the selected season.
   *
   * If both `year` and `season` are provided, updates the selected year and season.
   * Clears the current anime list, resets the page to 1, and sets the `hasMore` flag to true.
   */
  const resetAndFetch = (year?: number, season?: string) => {
    console.log("resetAndFetch called with:", year, season);
    if (year && season) {
      setSelectedYear(year);
      setSelectedSeason(season);
    }
    setAnimes([]);
    setPage(1);
    setHasMore(true);
    fetchAnimes();
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  // initialize selectedYear and selectedSeason
  useEffect(() => {
    if (selectedYear && selectedSeason) {
      setPage(1);
      setAnimes([]);
      setHasMore(true);
    }
  }, [selectedYear, selectedSeason]);

  useEffect(() => {
    if (!selectedYear || !selectedSeason || !page) return;
    fetchAnimes();
  }, [selectedYear, selectedSeason, page]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const target = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMore]);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <>
      <div className="my-56"></div>

      {/* Header: Year and Season select, Edit button */}
      <div className="flex justify-between items-center my-10">
        {/* Year and Season Selects */}
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setPage(1);
              setAnimes([]);
              setHasMore(true);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setPage(1);
              setAnimes([]);
              setHasMore(true);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {availableSeasons.map((season) => (
              <option key={season} value={season}>
                {season.charAt(0) + season.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Edit button */}
        <button
          onClick={handleSync}
          className="border border-blue-500 dark:border-blue-400 rounded px-4 py-1 bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          Sync
        </button>
      </div>

      {/* Anime Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animes.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-20 text-lg">
            No anime found for this season.
          </div>
        ) : (
          animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              {...{ ...anime, id: Number(anime.id) }}
              refreshList={resetAndFetch}
            />
          ))
        )}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="text-center py-10 text-gray-500"></div>
      )}

      <div className="my-56"></div>
    </>
  );
};

export default AnimeList;
