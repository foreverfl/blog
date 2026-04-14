"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapViewProps } from "./types";

export default function MapboxMapView({
  center,
  marker,
  zoom,
  title,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!containerRef.current || mapRef.current || !token) return;

    mapboxgl.accessToken = token;
    (mapboxgl as Record<string, unknown>).collectResourceTiming = false;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
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

    const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
      `<div style="padding:4px 8px;font-size:13px;color:#333;">
        <strong>${marker.label}</strong><br/>
        ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}
      </div>`,
    );

    const m = new mapboxgl.Marker({ color: "#3b82f6" })
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
