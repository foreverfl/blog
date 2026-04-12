"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapViewProps } from "./types";
import { createVectorStyle } from "./selfHostedOsmStyle";

export default function SelfHostedOsmMapView({
  center,
  marker,
  zoom,
  title,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createVectorStyle(),
      center: [center.lng, center.lat],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("custom-spots", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [139.70392, 35.68386] },
              properties: { name: "A-Place代々木" },
            },
          ],
        },
      });

      map.addLayer({
        id: "custom-spots-icon",
        type: "circle",
        source: "custom-spots",
        paint: {
          "circle-radius": 7,
          "circle-color": "#e63946",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: "custom-spots-label",
        type: "symbol",
        source: "custom-spots",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 12,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#e63946",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom,
      duration: 1500,
    });
  }, [center, zoom]);

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
