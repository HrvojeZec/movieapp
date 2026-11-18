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
