import type { WIDGET_TYPES, WIDGET_VIEWS } from "./constants";

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

export interface DayActivity {
  /** "YYYY-MM-DD" in UTC */
  date: string;
  watched: number;
  views: number;
}

/** Consecutive days with at least one watched movie or page view. */
export interface Streak {
  current: number;
  longest: number;
}

export interface UserStats {
  totals: { watched: number; favorites: number; watchlist: number; lists: number };
  topGenres: GenreCount[];
  /** The last STATS_MONTHS months, oldest first, empty months included. */
  activityByMonth: MonthActivity[];
  /** The last STATS_DAYS days, oldest first, only days with activity. */
  activityByDay: DayActivity[];
  streak: Streak;
  /** IDs of the most recently watched movies, newest first. */
  recentWatched: string[];
}

export type WidgetType = (typeof WIDGET_TYPES)[number];

export type WidgetView = (typeof WIDGET_VIEWS)[number];

/** A widget's cell on the 12-column dashboard grid. */
export interface LayoutItem {
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Charts can be shown as a table; left out means the chart. */
  view?: WidgetView;
}

/** [columns, rows] */
export type WidgetSize = readonly [number, number];

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  /** "YYYY-MM-DD" in UTC */
  date: string;
  /** Watched movies plus movie pages opened. */
  count: number;
  level: HeatmapLevel;
  /** Later this week than today; drawn empty. */
  future: boolean;
}
