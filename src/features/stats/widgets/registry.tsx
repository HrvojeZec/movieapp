import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import dayjs from "dayjs";
import {
  Bookmark,
  CalendarDays,
  CalendarRange,
  Clapperboard,
  Eye,
  Flame,
  Heart,
  List,
  PieChart,
  Tags,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { DONUT_GENRES, GRID_GAP, GRID_ROW_HEIGHT } from "@/features/stats/constants";
import { monthlyActivity, topWithOther } from "@/features/stats/lib/chart-geometry";
import { DataTable } from "@/features/stats/ui/DataTable/DataTable";
import type { MonthActivity, UserStats, WidgetType } from "@/features/stats/types";
import { BarList } from "@/features/stats/ui/BarList/BarList";
import { ActivityHeatmap } from "@/features/stats/ui/ActivityHeatmap/ActivityHeatmap";
import { GenreDonut } from "@/features/stats/ui/GenreDonut/GenreDonut";
import { RecentWatched } from "@/features/stats/ui/RecentWatched/RecentWatched";
import { StatTile } from "@/features/stats/ui/StatTile/StatTile";
import { StreakRing } from "@/features/stats/ui/StreakRing/StreakRing";
import { TrendLine } from "@/features/stats/ui/TrendLine/TrendLine";
import { WatchedMonthly } from "@/features/stats/ui/WatchedMonthly/WatchedMonthly";

export interface WidgetProps {
  stats: UserStats;
  /** Cells the widget takes, so its content can fit the space. */
  size: { w: number; h: number };
  /** When the stats were loaded (ms); date-based widgets end on that day. */
  now: number;
}

export interface WidgetDefinition {
  title: string;
  /** One line for the palette. */
  description: string;
  icon: LucideIcon;
  /** Tiles carry their own label, so they show no header outside editing. */
  bare?: boolean;
  render: (props: WidgetProps) => ReactNode;
  /** The same data as a table, for widgets in TABLE_VIEW_WIDGETS. */
  renderTable?: (props: WidgetProps) => ReactNode;
}

// Padding, header and gap of a widget frame, and the height of one bar row
const FRAME_CHROME_PX = 76;
const BAR_ROW_PX = 34;
const MIN_BAR_ROWS = 3;
// Tiles at least this big have room for a trend line
const TREND_TILE = { w: 4, h: 3 };

const barRowsFor = (rows: number) =>
  Math.max(
    MIN_BAR_ROWS,
    Math.floor((rows * GRID_ROW_HEIGHT + (rows - 1) * GRID_GAP - FRAME_CHROME_PX) / BAR_ROW_PX),
  );

const monthColumns = (months: MonthActivity[], key: "watched" | "views") =>
  months.map((entry) => {
    const month = dayjs(`${entry.month}-01`);
    return {
      key: entry.month,
      shortLabel: month.format("MMM"),
      fullLabel: month.format("MMMM YYYY"),
      value: entry[key],
    };
  });

const PERCENT = 100;

const monthRows = (months: MonthActivity[], key: "watched" | "views") =>
  [...months]
    .reverse()
    .map((entry) => [dayjs(`${entry.month}-01`).format("MMMM YYYY"), entry[key]]);

const tile = (
  title: string,
  description: string,
  icon: LucideIcon,
  label: string,
  pick: (totals: UserStats["totals"]) => number,
  trend?: (stats: UserStats) => number[],
): WidgetDefinition => ({
  title,
  description,
  icon,
  bare: true,
  render: ({ stats, size }) => (
    <StatTile
      value={pick(stats.totals)}
      label={label}
      size={size}
      trend={trend && size.w >= TREND_TILE.w && size.h >= TREND_TILE.h ? trend(stats) : undefined}
    />
  ),
});

export const WIDGETS: Record<WidgetType, WidgetDefinition> = {
  tileWatched: tile(
    "Movies watched",
    "How many movies you've marked as watched.",
    Eye,
    "Movies watched",
    (totals) => totals.watched,
    (stats) => stats.activityByMonth.map((month) => month.watched),
  ),
  tileFavorites: tile(
    "Favorites",
    "How many movies you've saved as favorites.",
    Heart,
    "Favorites",
    (totals) => totals.favorites,
  ),
  tileWatchlist: tile(
    "Watchlist",
    "How many movies wait on your watchlist.",
    Bookmark,
    "On the watchlist",
    (totals) => totals.watchlist,
  ),
  tileLists: tile("Lists", "How many lists you've made.", List, "Lists", (totals) => totals.lists),
  genreBars: {
    title: "Favorite genres",
    description: "The genres of your watched and favorite movies.",
    icon: Tags,
    render: ({ stats, size }) =>
      stats.topGenres.length > 0 ? (
        <BarList
          label="Favorite genres, by number of watched and favorite movies"
          items={stats.topGenres.map((genre) => ({
            key: genre.id,
            label: genre.name,
            value: genre.count,
          }))}
          unit={["movie", "movies"]}
          limit={barRowsFor(size.h)}
        />
      ) : (
        <Text c="dimmed" size="sm">
          Mark movies as watched or add favorites to see which genres you like most.
        </Text>
      ),
    renderTable: ({ stats }) => (
      <DataTable
        label="Favorite genres, by number of watched and favorite movies"
        columns={["Genre", "Movies"]}
        rows={stats.topGenres.map((genre) => [genre.name, genre.count])}
        emptyText="Mark movies as watched or add favorites to see which genres you like most."
      />
    ),
  },
  // Two charts rather than one: page views outnumber watched movies, so they need their own scale
  watchedMonthly: {
    title: "Watched per month",
    description: "Movies you marked as watched, month by month.",
    icon: CalendarDays,
    render: ({ stats }) => (
      <WatchedMonthly
        columns={monthColumns(stats.activityByMonth, "watched")}
        unit={["movie watched", "movies watched"]}
      />
    ),
    renderTable: ({ stats }) => (
      <DataTable
        label="Movies watched per month, last 12 months"
        columns={["Month", "Movies watched"]}
        rows={monthRows(stats.activityByMonth, "watched")}
        emptyText="Movies you mark as watched show up here month by month."
      />
    ),
  },
  viewsTrend: {
    title: "Pages opened per month",
    description: "Movie pages you opened, month by month.",
    icon: TrendingUp,
    render: ({ stats }) => (
      <TrendLine
        label="Movie pages opened per month, last 12 months"
        points={monthColumns(stats.activityByMonth, "views")}
        unit={["movie page opened", "movie pages opened"]}
        emptyText="Movie pages you open over the year show up here as a trend."
      />
    ),
    renderTable: ({ stats }) => (
      <DataTable
        label="Movie pages opened per month, last 12 months"
        columns={["Month", "Pages opened"]}
        rows={monthRows(stats.activityByMonth, "views")}
        emptyText="Movie pages you open over the year show up here."
      />
    ),
  },
  genreDonut: {
    title: "Genre mix",
    description: "The share of your top genres, the rest as Other.",
    icon: PieChart,
    render: ({ stats }) => <GenreDonut genres={stats.topGenres} />,
    renderTable: ({ stats }) => {
      const slices = topWithOther(stats.topGenres, DONUT_GENRES);
      const total = slices.reduce((sum, slice) => sum + slice.count, 0);
      return (
        <DataTable
          label="Share of your top genres among watched and favorite movies"
          columns={["Genre", "Share", "Movies"]}
          rows={slices.map((slice) => [
            slice.label,
            `${Math.round((slice.count / total) * PERCENT)}%`,
            slice.count,
          ])}
          emptyText="Mark movies as watched or add favorites to see your mix of genres."
        />
      );
    },
  },
  activityHeatmap: {
    title: "Activity calendar",
    description: "A year of days: movies watched and pages opened.",
    icon: CalendarRange,
    render: ({ stats, now }) => <ActivityHeatmap days={stats.activityByDay} now={now} />,
    renderTable: ({ stats }) => (
      <DataTable
        label="Activity per month in the last year"
        columns={["Month", "Active days", "Activities"]}
        rows={monthlyActivity(stats.activityByDay).map((month) => [
          dayjs(`${month.month}-01`).format("MMMM YYYY"),
          month.activeDays,
          month.activities,
        ])}
        emptyText="No activity in the last year yet. Open a movie or mark one as watched."
      />
    ),
  },
  streak: {
    title: "Streak",
    description: "Days in a row with something watched or opened.",
    icon: Flame,
    render: ({ stats }) => (
      <StreakRing current={stats.streak.current} longest={stats.streak.longest} />
    ),
  },
  recentWatched: {
    title: "Recently watched",
    description: "Posters of the movies you watched last.",
    icon: Clapperboard,
    render: ({ stats }) => <RecentWatched ids={stats.recentWatched} />,
  },
};
