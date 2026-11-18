import type { WIDGET_TYPES } from "./constants";

export interface GenreCount {
  id: number;
  name: string;
  count: number;
}

export interface MonthActivity {
  /** "YYYY-MM" in UTC */
  month: string;
  watched: number;
  views: number;
}

export interface UserStats {
  totals: { watched: number; favorites: number; watchlist: number; lists: number };
  topGenres: GenreCount[];
  /** The last STATS_MONTHS months, oldest first, empty months included. */
  activityByMonth: MonthActivity[];
}

export type WidgetType = (typeof WIDGET_TYPES)[number];

/** A widget's cell on the 12-column dashboard grid. */
export interface LayoutItem {
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** [columns, rows] */
export type WidgetSize = readonly [number, number];
