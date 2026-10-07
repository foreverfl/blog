import { layers, namedFlavor } from "@protomaps/basemaps";
import { addProtocol, Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "react";

const JAPAN_PMTILES_URL =
  "pmtiles://https://assets-map.mogumogu.dev/japan.pmtiles";
const BASEMAP_ASSETS_URL = "https://protomaps.github.io/basemaps-assets";

// Vite does not carry the worker file along when it pre-bundles maplibre, so hand it the url.
setWorkerUrl(maplibreWorkerUrl);

// One registration per page: the protocol turns pmtiles:// into Range requests.
addProtocol("pmtiles", new Protocol().tile);

type MapLibreMapProps = {
  /** [lng, lat] the map opens on. */
  center: [number, number];
  zoom: number;
  /** Called right after the map is created, so a caller can add markers or move it. */
  onMap?: (map: Map) => void;
};

/**
 * Japan basemap drawn from the pmtiles file on R2. Needs window (WebGL), so
 * mount it with client:only="react".
 *
 * @param props - { center: [139.7, 35.7], zoom: 5, onMap }
 * @returns a full-size div the map renders into
 */
export default function MapLibreMap({ center, zoom, onMap }: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // The map is built once; later moves are the caller's job through onMap.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          protomaps: {
            type: "vector",
            url: JAPAN_PMTILES_URL,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        glyphs: `${BASEMAP_ASSETS_URL}/fonts/{fontstack}/{range}.pbf`,
        sprite: `${BASEMAP_ASSETS_URL}/sprites/v4/light`,
        layers: layers("protomaps", namedFlavor("light"), { lang: "ja" }),
      },
      center,
      zoom,
    });
    map.addControl(new NavigationControl(), "top-right");
    onMap?.(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
