import type { LayoutItem, WidgetSize, WidgetType } from "./types";

export const STATS_MONTHS = 12;
/** Days of daily activity (the calendar widget and streaks). */
export const STATS_DAYS = 365;
export const RECENT_WATCHED_LIMIT = 8;
export const TOP_GENRES_LIMIT = 8;
// Favorites have no stored genres, so each one is a (cached) TMDB lookup; only the newest count
export const MAX_FAVORITES_FOR_GENRES = 100;

export const GRID_COLUMNS = 12;
export const TABLET_GRID_COLUMNS = 6;
export const PHONE_GRID_COLUMNS = 1;
export const GRID_ROW_HEIGHT = 72;
export const GRID_GAP = 16;

// One of each widget on the board, so the type doubles as the widget's id
export const WIDGET_TYPES = [
  "tileWatched",
  "tileFavorites",
  "tileWatchlist",
  "tileLists",
  "genreBars",
  "watchedMonthly",
  "viewsTrend",
] as const;

const TILE_SIZE = { min: [2, 2], max: [4, 3], default: [3, 2] } as const;
const CHART_SIZE = { min: [4, 4], max: [12, 6], default: [6, 5] } as const;

export const WIDGET_SIZES: Record<
  WidgetType,
  { min: WidgetSize; max: WidgetSize; default: WidgetSize }
> = {
  tileWatched: TILE_SIZE,
  tileFavorites: TILE_SIZE,
  tileWatchlist: TILE_SIZE,
  tileLists: TILE_SIZE,
  genreBars: { min: [4, 4], max: [12, 8], default: [6, 5] },
  watchedMonthly: CHART_SIZE,
  viewsTrend: CHART_SIZE,
};

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
  { type: "tileFavorites", x: 3, y: 0, w: 3, h: 2 },
  { type: "tileWatchlist", x: 6, y: 0, w: 3, h: 2 },
  { type: "tileLists", x: 9, y: 0, w: 3, h: 2 },
  { type: "genreBars", x: 0, y: 2, w: 6, h: 5 },
  { type: "watchedMonthly", x: 6, y: 2, w: 6, h: 5 },
  { type: "viewsTrend", x: 0, y: 7, w: 12, h: 5 },
];
