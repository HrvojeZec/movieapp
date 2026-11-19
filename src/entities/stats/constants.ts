import type { LayoutItem, WidgetSize, WidgetType } from "./types";

export const STATS_MONTHS = 12;
/** Days of daily activity (the calendar widget and streaks). */
export const STATS_DAYS = 365;
export const RECENT_WATCHED_LIMIT = 8;
/** Columns of the activity calendar: a year of weeks, the last one partly ahead of today. */
export const HEATMAP_WEEKS = 53;
export const DONUT_GENRES = 5;
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
  "genreDonut",
  "activityHeatmap",
  "streak",
  "recentWatched",
] as const;

/** How a chart widget can be shown; the first is the default and isn't stored. */
export const WIDGET_VIEWS = ["chart", "table"] as const;

/** Widgets whose data reads as a table too; tiles, the streak and posters don't. */
export const TABLE_VIEW_WIDGETS: readonly WidgetType[] = [
  "genreBars",
  "genreDonut",
  "watchedMonthly",
  "viewsTrend",
  "activityHeatmap",
];

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
  genreDonut: { min: [3, 4], max: [6, 6], default: [6, 5] },
  activityHeatmap: { min: [6, 3], max: [12, 5], default: [12, 4] },
  streak: { min: [3, 3], max: [6, 4], default: [4, 4] },
  recentWatched: { min: [4, 3], max: [12, 4], default: [8, 4] },
};

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { type: "tileWatched", x: 0, y: 0, w: 3, h: 2 },
  { type: "tileFavorites", x: 3, y: 0, w: 3, h: 2 },
  { type: "tileWatchlist", x: 6, y: 0, w: 3, h: 2 },
  { type: "tileLists", x: 9, y: 0, w: 3, h: 2 },
  { type: "activityHeatmap", x: 0, y: 2, w: 12, h: 4 },
  { type: "genreBars", x: 0, y: 6, w: 6, h: 5 },
  { type: "genreDonut", x: 6, y: 6, w: 6, h: 5 },
  { type: "watchedMonthly", x: 0, y: 11, w: 6, h: 5 },
  { type: "viewsTrend", x: 6, y: 11, w: 6, h: 5 },
  { type: "streak", x: 0, y: 16, w: 4, h: 4 },
  { type: "recentWatched", x: 4, y: 16, w: 8, h: 4 },
];

// Board widths (not viewport widths) where the grid switches column counts; the sidebar can
// take a quarter of a laptop screen
export const GRID_DESKTOP_MIN_WIDTH = 900;
export const GRID_TABLET_MIN_WIDTH = 600;
/** Wait after the last change before the layout is saved. */
export const DASHBOARD_SAVE_DEBOUNCE_MS = 800;
