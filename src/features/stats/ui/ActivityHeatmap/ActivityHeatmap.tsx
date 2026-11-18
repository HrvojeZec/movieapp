"use client";
import { useState, type CSSProperties, type PointerEvent } from "react";
import { Group, Text, VisuallyHidden } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import dayjs from "dayjs";
import { heatmapWeeks } from "@/features/stats/lib/chart-geometry";
import type { DayActivity, HeatmapCell, HeatmapLevel } from "@/features/stats/types";
import { pluralize } from "@/shared/lib/format";
import classes from "./ActivityHeatmap.module.scss";

// SVG units: a cell, the gap after it, and room for the weekday and month labels
const CELL = 10;
const STEP = 12;
const LABEL_WIDTH = 22;
const LABEL_HEIGHT = 12;
const LEVELS: HeatmapLevel[] = [0, 1, 2, 3, 4];
// Narrow widgets show only the latest weeks, so a cell never gets smaller than this
const MIN_CELL_PX = 11;
const MIN_WEEKS = 8;

/** How many of the latest weeks fit a calendar this many pixels wide. */
const weeksThatFit = (pixels: number, available: number) =>
  Math.min(
    available,
    Math.max(MIN_WEEKS, Math.floor(((pixels * CELL) / MIN_CELL_PX - LABEL_WIDTH) / STEP)),
  );
// Monday, Wednesday and Friday rows are labelled, like most calendars
const WEEKDAY_LABELS: [number, string][] = [
  [0, "Mon"],
  [2, "Wed"],
  [4, "Fri"],
];

const describeDay = (cell: HeatmapCell) =>
  `${dayjs(cell.date).format("ddd, MMM D, YYYY")}: ${cell.count} ${pluralize(cell.count, "activity", "activities")}`;

interface ActivityHeatmapProps {
  days: DayActivity[];
  /** When the stats were loaded; the calendar ends on that day. */
  now: number;
}

/**
 * A year of days as a calendar, one column per week: the brighter the cell, the more movies
 * watched and pages opened that day. Hovering a day writes it out under the calendar; a narrow
 * widget shows the latest weeks only (the table for screen readers keeps the whole year).
 */
export function ActivityHeatmap({ days, now }: ActivityHeatmapProps) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);
  const { ref, width: pixels } = useElementSize<HTMLDivElement>();
  const year = heatmapWeeks(days, new Date(now));
  const weeks = pixels > 0 ? year.slice(-weeksThatFit(pixels, year.length)) : year;
  const width = LABEL_WIDTH + weeks.length * STEP;
  const height = LABEL_HEIGHT + 7 * STEP;
  const activeDays = year.flat().filter((cell) => cell.count > 0).length;

  const monthLabels = weeks.flatMap((week, index) => {
    const month = week[0].date.slice(0, "YYYY-MM".length);
    const previous = weeks[index - 1]?.[0].date.slice(0, "YYYY-MM".length);
    return index > 0 && month !== previous
      ? [{ index, label: dayjs(week[0].date).format("MMM") }]
      : [];
  });

  const hover = (event: PointerEvent<SVGSVGElement>) => {
    const key = (event.target as Element).getAttribute("data-cell");
    if (!key) return;
    const [week, weekday] = key.split("-").map(Number);
    setHovered(weeks[week][weekday]);
  };

  return (
    <div ref={ref} className={classes.heatmap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={classes.calendar}
        aria-hidden
        onPointerOver={hover}
        onPointerLeave={() => setHovered(null)}
      >
        {monthLabels.map(({ index, label }) => (
          <text key={index} x={LABEL_WIDTH + index * STEP} y={8} className={classes.label}>
            {label}
          </text>
        ))}
        {WEEKDAY_LABELS.map(([weekday, label]) => (
          <text
            key={label}
            x={0}
            y={LABEL_HEIGHT + weekday * STEP + CELL - 1}
            className={classes.label}
          >
            {label}
          </text>
        ))}
        {weeks.map((week, weekIndex) =>
          week.map((cell, weekday) =>
            cell.future ? null : (
              <rect
                key={cell.date}
                data-cell={`${weekIndex}-${weekday}`}
                data-level={cell.level}
                x={LABEL_WIDTH + weekIndex * STEP}
                y={LABEL_HEIGHT + weekday * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                className={classes.cell}
                // The wave runs across the weeks
                style={{ "--week": weekIndex } as CSSProperties}
              />
            ),
          ),
        )}
      </svg>

      <Group justify="space-between" gap="xs" wrap="nowrap" className={classes.footer}>
        <Text size="xs" c="dimmed" truncate>
          {hovered
            ? describeDay(hovered)
            : activeDays > 0
              ? `${activeDays} active ${pluralize(activeDays, "day")} in the last year`
              : "No activity in the last year yet. Open a movie or mark one as watched."}
        </Text>
        <Group gap={4} wrap="nowrap" aria-hidden>
          <Text size="xs" c="dimmed">
            Less
          </Text>
          {LEVELS.map((level) => (
            <span key={level} className={classes.swatch} data-level={level} />
          ))}
          <Text size="xs" c="dimmed">
            More
          </Text>
        </Group>
      </Group>

      <VisuallyHidden>
        <table>
          <caption>Days with activity in the last year</caption>
          <tbody>
            {year
              .flat()
              .filter((cell) => cell.count > 0)
              .map((cell) => (
                <tr key={cell.date}>
                  <th scope="row">{dayjs(cell.date).format("MMMM D, YYYY")}</th>
                  <td>
                    {cell.count} {pluralize(cell.count, "activity", "activities")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
}
