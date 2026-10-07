export type PlaceGroup = "its" | "ur" | "visited";

// Field names follow the its_facilities columns so GET /its/facilities can replace this file as is.
export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  group: PlaceGroup;
  kind?: "direct" | "yearround" | "seasonal";
  prefecture?: string;
  city?: string;
  min_party?: number | null;
  /** The ITS page for the facility. */
  detail_url?: string;
  /** The hotel's own website. */
  site_url?: string | null;
  /** One representative photo on the blog asset bucket. */
  image_url?: string | null;
  /** YYYY-MM-DD, or null when not visited yet. */
  visited_on?: string | null;
  /** How many times I applied for it; counted from its_applications once the api exists. */
  applied_count?: number;
};

export const PLACE_GROUPS: { value: PlaceGroup; label: string }[] = [
  { value: "its", label: "ITS" },
  { value: "ur", label: "UR" },
  { value: "visited", label: "Visited" },
];

const ITS_PAGE = "https://www.its-kenpo.or.jp/shisetsu/keiyaku/tsunen";

// Hardcoded until GET /its/facilities and GET /places exist on blog-v2.
// ITS rows are copied from journey-its.sql; visited_on and applied_count are placeholders.
export const PLACES: Place[] = [
  {
    id: "its-harvest-nasu",
    name: "ホテルハーヴェスト那須",
    lat: 37.079765,
    lng: 140.024887,
    group: "its",
    kind: "yearround",
    prefecture: "栃木県",
    city: "那須町",
    min_party: 2,
    detail_url: `${ITS_PAGE}/nasu/index.html`,
    site_url: "https://www.harvestclub.com/Un/Hotel/Nu/",
    image_url: null,
    visited_on: "2026-08-15",
    applied_count: 2,
  },
  {
    id: "its-kusatsu-village",
    name: "草津温泉 ホテルヴィレッジ",
    lat: 36.62767,
    lng: 138.604202,
    group: "its",
    kind: "yearround",
    prefecture: "群馬県",
    city: "草津町",
    min_party: 2,
    detail_url: `${ITS_PAGE}/kusatsu/index.html`,
    site_url: "https://www.hotelvillage.co.jp/",
    image_url: null,
    visited_on: null,
    applied_count: 1,
  },
  {
    id: "its-okura-tokyo-bay",
    name: "ホテルオークラ東京ベイ",
    lat: 35.631264,
    lng: 139.874329,
    group: "its",
    kind: "yearround",
    prefecture: "千葉県",
    city: "浦安市",
    min_party: 2,
    detail_url: `${ITS_PAGE}/tokyobay/index.html`,
    site_url: "https://www.okuratokyobay.net/",
    image_url: null,
    visited_on: null,
    applied_count: 0,
  },
  {
    id: "its-lavista-fujikawaguchiko",
    name: "ラビスタ富士河口湖",
    lat: 35.543289,
    lng: 138.779053,
    group: "its",
    kind: "yearround",
    prefecture: "山梨県",
    city: "富士河口湖町",
    min_party: 2,
    detail_url: `${ITS_PAGE}/la_fuji/index.html`,
    site_url: "https://dormy-hotels.com/resort/hotels/la_kawaguchiko/",
    image_url: null,
    visited_on: null,
    applied_count: 3,
  },
  {
    id: "its-atami-korakuen",
    name: "熱海後楽園ホテル",
    lat: 35.088181,
    lng: 139.079361,
    group: "its",
    kind: "yearround",
    prefecture: "静岡県",
    city: "熱海市",
    min_party: 2,
    detail_url: `${ITS_PAGE}/atamikorakuen/index.html`,
    site_url: "https://www.atamikorakuen.co.jp/",
    image_url: null,
    visited_on: "2026-05-03",
    applied_count: 1,
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
