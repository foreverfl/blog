export interface MapCoords {
  lat: number;
  lng: number;
}

export interface MapViewProps {
  center: MapCoords;
  marker: (MapCoords & { label: string }) | null;
  zoom: number;
  title: string;
}
