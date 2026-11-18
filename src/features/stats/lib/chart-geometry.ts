import { HEATMAP_WEEKS } from "@/features/stats/constants";
import type { DayActivity, GenreCount, HeatmapCell, HeatmapLevel } from "@/features/stats/types";
import { DAY_MS } from "@/shared/lib/time";

const FULL_TURN = 360;
const DAYS_PER_WEEK = 7;

const round = (value: number) => Math.round(value * 100) / 100;

// Angles run clockwise from 12 o'clock
const pointOn = (center: number, radius: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  return `${round(center + radius * Math.sin(radians))} ${round(center - radius * Math.cos(radians))}`;
};

function ringSegment(center: number, outer: number, inner: number, start: number, end: number) {
  const large = end - start > FULL_TURN / 2 ? 1 : 0;
  return [
    `M${pointOn(center, outer, start)}`,
    `A${outer} ${outer} 0 ${large} 1 ${pointOn(center, outer, end)}`,
    `L${pointOn(center, inner, end)}`,
    `A${inner} ${inner} 0 ${large} 0 ${pointOn(center, inner, start)}`,
    "Z",
  ].join(" ");
}

export interface DonutArc {
  /** Position of the value in the input, for its color and label. */
  index: number;
  startAngle: number;
  endAngle: number;
  path: string;
}

/**
 * Ring segments for a donut of `radius` (centered in a 2·radius square), one per non-zero
 * value, separated by `gapDegrees` so neighbouring colors never touch.
 */
export function donutArcs(
  values: number[],
  { radius, thickness, gapDegrees }: { radius: number; thickness: number; gapDegrees: number },
): DonutArc[] {
  const present = values.flatMap((value, index) => (value > 0 ? [{ value, index }] : []));
  const total = present.reduce((sum, { value }) => sum + value, 0);
  if (total === 0) return [];
  const inner = radius - thickness;

  if (present.length === 1) {
    // SVG can't draw a full circle with one arc, so the ring is two halves
    const half = FULL_TURN / 2;
    const path = `${ringSegment(radius, radius, inner, 0, half)} ${ringSegment(radius, radius, inner, half, FULL_TURN)}`;
    return [{ index: present[0].index, startAngle: 0, endAngle: FULL_TURN, path }];
  }

  const available = FULL_TURN - present.length * gapDegrees;
  let angle = gapDegrees / 2;
  return present.map(({ value, index }) => {
    const startAngle = round(angle);
    const endAngle = round(angle + (value / total) * available);
    angle = endAngle + gapDegrees;
    return {
      index,
      startAngle,
      endAngle,
      path: ringSegment(radius, radius, inner, startAngle, endAngle),
    };
  });
}

/** A line (and the area under it) through evenly spaced points, scaled so the highest touches the top. */
export function linePath(points: number[], width: number, height: number) {
  if (points.length === 0) return { line: "", area: "" };
  const max = Math.max(...points);
  const coordinates = points.map((value, index) => {
    const x = points.length === 1 ? width / 2 : (index * width) / (points.length - 1);
    const y = max > 0 ? height - (value / max) * height : height;
    return `${round(x)} ${round(y)}`;
  });
  const line = `M${coordinates.join(" L")}`;
  const first = coordinates[0].split(" ")[0];
  const last = coordinates.at(-1)!.split(" ")[0];
  return { line, area: `${line} L${last} ${height} L${first} ${height} Z` };
}

const dayKey = (time: number) => new Date(time).toISOString().slice(0, "YYYY-MM-DD".length);

// Nearest-rank quantile of an ascending list
const quantile = (sorted: number[], share: number) =>
  sorted[Math.max(0, Math.ceil(share * sorted.length) - 1)];

const QUARTILES = [0.25, 0.5, 0.75] as const;

/**
 * The activity calendar: HEATMAP_WEEKS columns of Monday–Sunday (UTC), the last one holding
 * today. Days with activity get a level 1–4 by quartile; the busiest days are always 4.
 */
export function heatmapWeeks(days: DayActivity[], now: Date): HeatmapCell[][] {
  const counts = new Map(days.map((day) => [day.date, day.watched + day.views]));
  const active = [...counts.values()].filter((count) => count > 0).sort((a, b) => a - b);
  const max = active.at(-1) ?? 0;
  const thresholds = QUARTILES.map((share) => (active.length ? quantile(active, share) : 0));
  const levelOf = (count: number): HeatmapLevel => {
    if (count === 0) return 0;
    if (count >= max) return 4;
    const below = thresholds.findIndex((threshold) => count <= threshold);
    return (below === -1 ? 4 : below + 1) as HeatmapLevel;
  };

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const sinceMonday = (now.getUTCDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const start = today - (sinceMonday + (HEATMAP_WEEKS - 1) * DAYS_PER_WEEK) * DAY_MS;

  return Array.from({ length: HEATMAP_WEEKS }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, weekday) => {
      const time = start + (week * DAYS_PER_WEEK + weekday) * DAY_MS;
      const date = dayKey(time);
      const count = counts.get(date) ?? 0;
      return { date, count, level: levelOf(count), future: time > today };
    }),
  );
}

/** The top genres by name, with everything after them added up as "Other". */
export function topWithOther(genres: GenreCount[], limit: number) {
  const top = genres.slice(0, limit).map((genre) => ({ label: genre.name, count: genre.count }));
  const rest = genres.slice(limit).reduce((sum, genre) => sum + genre.count, 0);
  return rest > 0 ? [...top, { label: "Other", count: rest }] : top;
}
