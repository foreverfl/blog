"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

const TILE_URL = "/osm/tile";

interface LocationInfo {
  lat: number;
  lng: number;
  label: string;
}

export default function MapLab() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  useEffect(() => {
    if (["en", "ja", "ko"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [`${TILE_URL}/{z}/{x}/{y}.png`],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [139.7005, 35.6938],
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current || !location) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const el = document.createElement("div");
    el.className = "map-lab-marker";
    el.style.cssText = `
      width: 20px; height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;

    const popup = new maplibregl.Popup({ offset: 15 }).setHTML(
      `<div style="padding:4px 8px;font-size:13px;color:#333;">
        <strong>${location.label}</strong><br/>
        ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
      </div>`,
    );

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([location.lng, location.lat])
      .setPopup(popup)
      .addTo(mapRef.current);

    marker.togglePopup();
    markerRef.current = marker;

    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 14,
      duration: 1500,
    });
  }, [location]);

  // Fetch precise location via Browser Geolocation API
  const fetchMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t("map_lab_geo_unavailable"));
      return;
    }

    setError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: t("map_lab_your_location"),
        });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(t("map_lab_geo_denied"));
            break;
          case err.POSITION_UNAVAILABLE:
            setError(t("map_lab_geo_unavailable"));
            break;
          case err.TIMEOUT:
            setError(t("map_lab_geo_timeout"));
            break;
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [t]);

  // Search location (frontend stub — backend logic TBD)
  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setError(null);
      setLoading(true);

      try {
        // TODO: replace with your own backend endpoint
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();

        if (data.lat && data.lng) {
          setLocation({
            lat: data.lat,
            lng: data.lng,
            label: data.name || searchQuery.trim(),
          });
        } else {
          setError(t("map_lab_search_no_result"));
        }
      } catch {
        setError(t("map_lab_search_fail"));
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, t],
  );

  return (
    <div className="flex flex-col items-center gap-4 p-6 mt-16">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t("map_lab_title")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {t("map_lab_description")}
      </p>

      {/* Search bar + My Location button */}
      <div className="w-full max-w-4xl flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("map_lab_search_placeholder")}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2.5 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
          >
            {t("map_lab_search")}
          </button>
        </form>
        <button
          onClick={fetchMyLocation}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
        >
          {loading ? t("map_lab_locating") : t("map_lab_my_location")}
        </button>
      </div>

      {/* Map */}
      <div
        ref={mapContainerRef}
        className="w-full max-w-4xl h-125 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
      />

      {/* Location info */}
      {location && !loading && (
        <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
            style={{ background: "#3b82f6" }}
          />
          {location.label}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
