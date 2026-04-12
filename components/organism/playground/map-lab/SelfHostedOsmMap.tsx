"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapViewProps } from "./types";

const TILE_URL = "/osm/tile";

export default function SelfHostedOsmMapView({
  center,
  marker,
  zoom,
  title,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [`${TILE_URL}/{z}/{x}/{y}.png`],
            tileSize: 256,
            attribution: "Self-hosted OpenStreetMap",
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
      center: [center.lng, center.lat],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update center
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom,
      duration: 1500,
    });
  }, [center, zoom]);

  // Update marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (!marker) return;

    const el = document.createElement("div");
    el.style.cssText = `
      width: 20px; height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;

    const popup = new maplibregl.Popup({ offset: 15 }).setHTML(
      `<div style="padding:4px 8px;font-size:13px;color:#333;">
        <strong>${marker.label}</strong><br/>
        ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}
      </div>`,
    );

    const m = new maplibregl.Marker({ element: el })
      .setLngLat([marker.lng, marker.lat])
      .setPopup(popup)
      .addTo(mapRef.current);

    m.togglePopup();
    markerRef.current = m;
  }, [marker]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {title}
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
