"use client";

import { useEffect, useRef, useCallback } from "react";
import type { MapViewProps } from "./types";

declare global {
  interface Window {
    google: typeof google;
    __googleMapsCallback?: () => void;
  }
}

let scriptLoaded = false;
let scriptLoading = false;
const callbacks: (() => void)[] = [];

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (scriptLoaded || typeof google !== "undefined") {
    scriptLoaded = true;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (scriptLoading) {
      callbacks.push(resolve);
      return;
    }
    // Check if script tag already exists in DOM (e.g. React Strict Mode re-run)
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      scriptLoading = true;
      callbacks.push(resolve);
      return;
    }
    scriptLoading = true;
    callbacks.push(resolve);

    window.__googleMapsCallback = () => {
      scriptLoaded = true;
      scriptLoading = false;
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geocoding&loading=async&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

export default function GoogleMapView({
  center,
  marker,
  zoom,
  title,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  const fallbackMarkerRef = useRef<google.maps.Marker | null>(null);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom,
      mapId: "map-lab-google",
      gestureHandling: "cooperative",
    });
  }, [center, zoom]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    loadGoogleMaps(apiKey).then(initMap);
  }, [initMap]);

  // Update center
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: center.lat, lng: center.lng });
    mapRef.current.setZoom(zoom);
  }, [center, zoom]);

  // Update marker
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous markers
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }
    if (fallbackMarkerRef.current) {
      fallbackMarkerRef.current.setMap(null);
      fallbackMarkerRef.current = null;
    }

    if (!marker) return;

    const position = { lat: marker.lat, lng: marker.lng };

    // Try AdvancedMarkerElement first, fall back to legacy Marker
    if (google.maps.marker?.AdvancedMarkerElement) {
      const adv = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: marker.label,
      });
      markerRef.current = adv;
    } else {
      const legacy = new google.maps.Marker({
        map: mapRef.current,
        position,
        title: marker.label,
      });
      fallbackMarkerRef.current = legacy;
    }
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
