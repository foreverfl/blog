"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import type { MapCoords } from "./map-lab/types";

const GoogleMapView = dynamic(() => import("./map-lab/GoogleMap"), {
  ssr: false,
});
const MapboxMapView = dynamic(() => import("./map-lab/MapboxMap"), {
  ssr: false,
});
const OsmProviderMapView = dynamic(() => import("./map-lab/OsmProviderMap"), {
  ssr: false,
});
const SelfHostedOsmMapView = dynamic(
  () => import("./map-lab/SelfHostedOsmMap"),
  { ssr: false },
);

const DEFAULT_CENTER: MapCoords = { lat: 35.6832, lng: 139.702 }; // Yoyogi
const DEFAULT_ZOOM = 17;

export default function MapLab() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  useEffect(() => {
    if (["en", "ja", "ko"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  const [center, setCenter] = useState<MapCoords>(DEFAULT_CENTER);
  const [marker, setMarker] = useState<(MapCoords & { label: string }) | null>(
    null,
  );
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmedCoords, setConfirmedCoords] = useState<MapCoords | null>(
    null,
  );

  // Search via Google Geocoding API
  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setError(null);
      setLoading(true);

      try {
        if (typeof google === "undefined" || !google.maps?.Geocoder) {
          setError(t("map_lab_search_fail"));
          return;
        }
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({
          address: searchQuery.trim(),
        });

        if (response.results && response.results.length > 0) {
          const loc = response.results[0].geometry.location;
          const name =
            response.results[0].formatted_address || searchQuery.trim();
          const coords = { lat: loc.lat(), lng: loc.lng() };
          setCenter(coords);
          setMarker({ ...coords, label: name });
          setZoom(14);
          setConfirmedCoords(null);
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

  // My Location via Browser Geolocation
  const fetchMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t("map_lab_geo_unavailable"));
      return;
    }

    setError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(coords);
        setMarker({ ...coords, label: t("map_lab_your_location") });
        setZoom(14);
        setConfirmedCoords(coords);
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

  // Confirm current marker coords
  const handleConfirm = useCallback(() => {
    if (marker) {
      setConfirmedCoords({ lat: marker.lat, lng: marker.lng });
    }
  }, [marker]);

  const mapProps = { center, marker, zoom };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mt-16">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("map_lab_search_placeholder")}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
          >
            {t("map_lab_search")}
          </button>
        </form>

        <button
          onClick={fetchMyLocation}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
        >
          {loading ? t("map_lab_locating") : t("map_lab_my_location")}
        </button>

        {marker && !confirmedCoords && (
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
          >
            {t("map_lab_confirm")}
          </button>
        )}
      </div>

      {/* Coords display */}
      {(confirmedCoords || marker) && (
        <div className="flex items-center justify-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm">
          {confirmedCoords ? (
            <span className="text-green-600 dark:text-green-400 font-mono">
              {t("map_lab_confirmed")}: {confirmedCoords.lat.toFixed(6)},{" "}
              {confirmedCoords.lng.toFixed(6)}
            </span>
          ) : (
            marker && (
              <span className="text-gray-600 dark:text-gray-300 font-mono">
                {marker.label}: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                \{" "}
              </span>
            )
          )}
          {error && (
            <span className="text-red-500 dark:text-red-400">{error}</span>
          )}
        </div>
      )}

      {/* Error only (no coords) */}
      {error && !confirmedCoords && !marker && (
        <div className="flex items-center justify-center px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm text-red-500 dark:text-red-400">
            {error}
          </span>
        </div>
      )}

      {/* 2x2 Map Grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 min-h-0">
        <div className="border-r border-b border-gray-300 dark:border-gray-600">
          <GoogleMapView {...mapProps} title="Google Maps" />
        </div>
        <div className="border-b border-gray-300 dark:border-gray-600">
          <MapboxMapView {...mapProps} title="Mapbox" />
        </div>
        <div className="border-r border-gray-300 dark:border-gray-600">
          <OsmProviderMapView {...mapProps} title="OSM (Provider)" />
        </div>
        <div>
          <SelfHostedOsmMapView {...mapProps} title="OSM (Self-hosted)" />
        </div>
      </div>
    </div>
  );
}
