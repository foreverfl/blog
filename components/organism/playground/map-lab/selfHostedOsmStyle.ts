import type maplibregl from "maplibre-gl";

export function createVectorStyle(): maplibregl.StyleSpecification {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  return {
    version: 8,
    sources: {
      openmaptiles: {
        type: "vector",
        tiles: [`${origin}/osm/data/japan/{z}/{x}/{y}.pbf`],
        maxzoom: 14,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sprite: `${origin}/api/sprites/sprite`,
    layers: [
      // Background
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#f0f0f0" },
      },

      // Water
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": "#a0cfdf", "fill-opacity": 0.8 },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": "#a0cfdf", "line-width": 1.5 },
      },

      // Landcover
      {
        id: "landcover-grass",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["==", "class", "grass"],
        paint: { "fill-color": "#d0e8c8", "fill-opacity": 0.6 },
      },
      {
        id: "landcover-wood",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", "class", "wood", "forest"],
        paint: { "fill-color": "#b8d9a9", "fill-opacity": 0.6 },
      },

      // Landuse
      {
        id: "landuse-residential",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["==", "class", "residential"],
        paint: { "fill-color": "#e8e4e0", "fill-opacity": 0.5 },
      },
      {
        id: "landuse-commercial",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["in", "class", "commercial", "retail"],
        paint: { "fill-color": "#f0e6d8", "fill-opacity": 0.5 },
      },

      // Park
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": "#c8e6b0", "fill-opacity": 0.6 },
      },

      // Building
      {
        id: "building",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": "#d5d0c8",
          "fill-opacity": 0.7,
          "fill-outline-color": "#bbb",
        },
      },

      // Transportation (roads)
      {
        id: "road-motorway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "motorway"],
        paint: {
          "line-color": "#ffa35c",
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 14, 6],
        },
      },
      {
        id: "road-trunk",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "trunk"],
        paint: {
          "line-color": "#ffc87f",
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.5, 14, 5],
        },
      },
      {
        id: "road-primary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "primary"],
        paint: {
          "line-color": "#ffe0a0",
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 14, 4],
        },
      },
      {
        id: "road-secondary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "secondary"],
        paint: {
          "line-color": "#ffffff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 14, 3],
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "tertiary", "minor", "service"],
        minzoom: 12,
        paint: {
          "line-color": "#ffffff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.5, 14, 2],
        },
      },

      // Pedestrian / footway / cycleway / steps
      {
        id: "road-path",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "path", "footway", "cycleway", "pedestrian"],
        minzoom: 14,
        paint: {
          "line-color": "#cba",
          "line-width": 1,
          "line-dasharray": [4, 2],
        },
      },
      {
        id: "road-steps",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "subclass", "steps"],
        minzoom: 15,
        paint: {
          "line-color": "#cba",
          "line-width": 2,
          "line-dasharray": [1, 1],
        },
      },

      // Bridge casing (elevated roads)
      {
        id: "bridge-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "all",
          ["==", "brunnel", "bridge"],
          ["in", "class", "primary", "secondary", "tertiary", "minor"],
        ],
        minzoom: 13,
        paint: {
          "line-color": "#c8c4bc",
          "line-width": ["interpolate", ["linear"], ["zoom"], 13, 3, 16, 8],
          "line-gap-width": 0,
        },
      },

      // Rail — classic black/white railroad pattern (2 layers)
      {
        id: "rail-base",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "rail"],
        paint: {
          "line-color": "#777",
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3],
        },
      },
      {
        id: "rail-dash",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "rail"],
        paint: {
          "line-color": "#fff",
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 14, 1.8],
          "line-dasharray": [6, 6],
        },
      },

      // Crosswalk / pedestrian crossing
      {
        id: "crossing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "subclass", "crossing"],
        minzoom: 16,
        paint: {
          "line-color": "#888",
          "line-width": 4,
          "line-dasharray": [1, 1],
        },
      },

      // Boundary
      {
        id: "boundary-country",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", "admin_level", 2],
        paint: {
          "line-color": "#9e9cab",
          "line-width": 1.5,
          "line-dasharray": [4, 2],
        },
      },

      // Labels - water
      {
        id: "water-name",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        layout: {
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#5d8cae",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      },

      // Labels - places
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["==", "class", "city"],
        layout: {
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 12, 10, 18],
        },
        paint: {
          "text-color": "#333",
          "text-halo-color": "#fff",
          "text-halo-width": 1.5,
        },
      },
      {
        id: "place-town",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["==", "class", "town"],
        minzoom: 7,
        layout: {
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 10, 12, 14],
        },
        paint: {
          "text-color": "#444",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      },
      {
        id: "place-village",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", "class", "village", "suburb", "neighbourhood"],
        minzoom: 11,
        layout: {
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#555",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      },

      // Labels - roads
      {
        id: "road-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 13,
        layout: {
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "symbol-placement": "line",
          "text-rotation-alignment": "map",
        },
        paint: {
          "text-color": "#666",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      },

      // POI - icon + label
      {
        id: "poi-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "poi",
        minzoom: 14,
        layout: {
          "icon-image": [
            "match",
            ["get", "subclass"],
            "cafe",
            "cafe",
            "restaurant",
            "restaurant",
            "fast_food",
            "fast-food",
            "bar",
            "bar",
            "pub",
            "beer",
            "bank",
            "bank",
            "atm",
            "bank",
            "pharmacy",
            "pharmacy",
            "hospital",
            "hospital",
            "clinic",
            "doctor",
            "dentist",
            "dentist",
            "school",
            "school",
            "kindergarten",
            "school",
            "university",
            "college",
            "library",
            "library",
            "post_office",
            "post",
            "police",
            "police",
            "fire_station",
            "fire-station",
            "supermarket",
            "grocery",
            "convenience",
            "grocery",
            "bakery",
            "bakery",
            "butcher",
            "slaughterhouse",
            "clothes",
            "clothing-store",
            "hairdresser",
            "hairdresser",
            "hotel",
            "lodging",
            "hostel",
            "lodging",
            "guest_house",
            "lodging",
            "fuel",
            "fuel",
            "parking",
            "parking",
            "bus_stop",
            "bus",
            "train_station",
            "rail",
            "subway",
            "rail",
            "place_of_worship",
            "place-of-worship",
            "park",
            "park",
            "playground",
            "playground",
            "swimming_pool",
            "swimming",
            "cinema",
            "cinema",
            "theatre",
            "theatre",
            "museum",
            "museum",
            "toilets",
            "toilet",
            "drinking_water",
            "drinking-water",
            "bicycle_parking",
            "bicycle",
            "car_repair",
            "car-repair",
            "laundry",
            "laundry",
            "veterinary",
            "veterinary",
            "garden",
            "garden",
            "sports_centre",
            "stadium",
            "fitness_centre",
            "fitness-centre",
            "ice_cream",
            "ice-cream",
            "confectionery",
            "confectionery",
            "",
          ],
          "icon-size": 0.6,
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-optional": true,
          "icon-allow-overlap": false,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#666",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      },

      // Labels - park
      {
        id: "park-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "park",
        filter: ["has", "name"],
        minzoom: 12,
        layout: {
          "text-field": ["coalesce", ["get", "name:ja"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
        },
        paint: {
          "text-color": "#3a7a2a",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      },
    ],
  };
}
