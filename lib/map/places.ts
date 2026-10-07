export type PlaceGroup = "its" | "ur" | "visited";

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  group: PlaceGroup;
};

export const PLACE_GROUPS: { value: PlaceGroup; label: string }[] = [
  { value: "its", label: "ITS" },
  { value: "ur", label: "UR" },
  { value: "visited", label: "Visited" },
];

// Hardcoded until GET /its/facilities and GET /places exist on blog-v2.
export const PLACES: Place[] = [
  {
    id: "its-hakone-viore",
    name: "トスラブ箱根ビオーレ",
    lat: 35.207855,
    lng: 139.038422,
    group: "its",
  },
  {
    id: "its-harvest-nasu",
    name: "ホテルハーヴェスト那須",
    lat: 37.079765,
    lng: 140.024887,
    group: "its",
  },
  {
    id: "ur-jindai",
    name: "神代団地",
    lat: 35.654198,
    lng: 139.573532,
    group: "ur",
  },
  {
    id: "ur-tamagawa",
    name: "多摩川住宅",
    lat: 35.639904,
    lng: 139.557037,
    group: "ur",
  },
  {
    id: "visited-yucho-chofu",
    name: "ゆうちょ銀行 調布店",
    lat: 35.652985,
    lng: 139.558411,
    group: "visited",
  },
  {
    id: "visited-smbc-chofu",
    name: "三井住友銀行 調布駅前支店",
    lat: 35.652668,
    lng: 139.544144,
    group: "visited",
  },
];
