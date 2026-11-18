"use client";
import { useState, type PointerEvent } from "react";
import { Text, VisuallyHidden } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { motion, useReducedMotion } from "motion/react";
import { linePath } from "@/features/stats/lib/chart-geometry";
import { EASE_OUT } from "@/shared/ui/motion/motion.constants";
import classes from "./TrendLine.module.scss";

const PERCENT = 100;
const DRAW_SECONDS = 1.2;

interface TrendLineProps {
  /** Names the chart for screen readers; the visible title sits above it. */
  label: string;
  points: { key: string; shortLabel: string; fullLabel: string; value: number }[];
  /** e.g. ["movie page opened", "movie pages opened"] */
  unit: [string, string];
  /** Shown instead of the chart when every value is zero. */
  emptyText: string;
}

const describe = (value: number, [singular, plural]: [string, string]) =>
  `${value} ${value === 1 ? singular : plural}`;

/**
 * One series over time as a line with a soft area under it. The line draws itself in; a dot
 * and a guide follow the pointer and the value under it is written above the plot.
 */
export function TrendLine({ label, points, unit, emptyText }: TrendLineProps) {
  const reduceMotion = useReducedMotion();
  // Drawn in real pixels: a stretched SVG distorts the stroke and breaks the drawing animation
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const [hovered, setHovered] = useState<number | null>(null);
  const values = points.map((point) => point.value);
  const max = Math.max(0, ...values);

  if (max === 0) {
    return (
      <Text c="dimmed" size="sm">
        {emptyText}
      </Text>
    );
  }

  const { line, area } = linePath(values, width, height);
  const xOf = (index: number) =>
    points.length === 1 ? PERCENT / 2 : (index / (points.length - 1)) * PERCENT;
  const focus = hovered === null ? null : points[hovered];

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const share = (event.clientX - rect.left) / rect.width;
    setHovered(Math.min(points.length - 1, Math.max(0, Math.round(share * (points.length - 1)))));
  };

  return (
    <div className={classes.trend}>
      <div aria-hidden className={classes.figure}>
        <Text size="xs" c="dimmed" className={classes.readout}>
          {focus ? `${focus.fullLabel}: ${describe(focus.value, unit)}` : `Highest: ${max}`}
        </Text>
        <div
          ref={ref}
          className={classes.plot}
          onPointerMove={track}
          onPointerLeave={() => setHovered(null)}
        >
          {width > 0 && (
            <svg viewBox={`0 0 ${width} ${height}`} className={classes.svg}>
              <path d={area} className={classes.area} />
              <motion.path
                d={line}
                className={classes.line}
                initial={reduceMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: DRAW_SECONDS, ease: EASE_OUT }}
              />
            </svg>
          )}
          {focus && hovered !== null && (
            <>
              <span className={classes.guide} style={{ left: `${xOf(hovered)}%` }} />
              <span
                className={classes.dot}
                style={{
                  left: `${xOf(hovered)}%`,
                  top: `${(1 - focus.value / max) * PERCENT}%`,
                }}
              />
            </>
          )}
        </div>
        <div className={classes.labels}>
          {points.map((point) => (
            <Text key={point.key} size="xs" c="dimmed" ta="center" className={classes.label}>
              {point.shortLabel}
            </Text>
          ))}
        </div>
      </div>

      <VisuallyHidden>
        <table>
          <caption>{label}</caption>
          <tbody>
            {points.map((point) => (
              <tr key={point.key}>
                <th scope="row">{point.fullLabel}</th>
                <td>{describe(point.value, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
}
