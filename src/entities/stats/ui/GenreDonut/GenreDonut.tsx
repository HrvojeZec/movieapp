"use client";
import { useState } from "react";
import { Text, VisuallyHidden } from "@mantine/core";
import { motion } from "motion/react";
import { DONUT_GENRES } from "@/entities/stats/constants";
import { donutArcs, topWithOther } from "@/entities/stats/lib/chart-geometry";
import type { GenreCount } from "@/entities/stats/types";
import { STAGGER_STEP, SPRINGS } from "@/shared/ui/motion/motion.constants";
import { RollingNumber } from "@/shared/ui/motion/RollingNumber/RollingNumber";
import classes from "./GenreDonut.module.scss";

const RING = { radius: 50, thickness: 14, gapDegrees: 2 };
const VIEW_BOX = `0 0 ${RING.radius * 2} ${RING.radius * 2}`;
const PERCENT = 100;

const percentOf = (count: number, total: number) => Math.round((count / total) * PERCENT);

/**
 * The share of the top genres as a ring, the rest folded into "Other". Each slice is named in
 * the legend beside it; hovering a slice or a legend row shows its share in the middle.
 */
export function GenreDonut({ genres }: { genres: GenreCount[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const slices = topWithOther(genres, DONUT_GENRES);
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  if (total === 0) {
    return (
      <Text c="dimmed" size="sm">
        Mark movies as watched or add favorites to see your mix of genres.
      </Text>
    );
  }

  const arcs = donutArcs(
    slices.map((slice) => slice.count),
    RING,
  );
  const focus = slices[hovered ?? 0];
  // Slots follow rank; "Other" is always the neutral color, never a series hue
  const colorOf = (index: number) =>
    slices[index].label === "Other" ? "var(--chart-other)" : `var(--chart-${index + 1})`;

  return (
    <div className={classes.container}>
      <div className={classes.donut}>
        <div className={classes.chart} aria-hidden>
          <svg viewBox={VIEW_BOX} className={classes.ring}>
            {arcs.map((arc, order) => (
              <motion.path
                key={slices[arc.index].label}
                d={arc.path}
                fill={colorOf(arc.index)}
                className={classes.slice}
                data-dimmed={hovered !== null && hovered !== arc.index ? true : undefined}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...SPRINGS.gentle, delay: order * STAGGER_STEP }}
                onPointerEnter={() => setHovered(arc.index)}
                onPointerLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          <div className={classes.center}>
            <Text component="span" fw={700} c="white" className={classes.share}>
              <RollingNumber value={percentOf(focus.count, total)} suffix="%" />
            </Text>
            <Text component="span" size="xs" c="dimmed" truncate>
              {focus.label}
            </Text>
          </div>
        </div>

        <ul className={classes.legend} aria-hidden>
          {slices.map((slice, index) => (
            <li
              key={slice.label}
              className={classes.legendRow}
              data-dimmed={hovered !== null && hovered !== index ? true : undefined}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered(null)}
            >
              <span className={classes.swatch} style={{ backgroundColor: colorOf(index) }} />
              <Text size="sm" c="gray.3" truncate className={classes.name}>
                {slice.label}
              </Text>
              <Text size="sm" c="dimmed" className={classes.value}>
                {percentOf(slice.count, total)}%
              </Text>
            </li>
          ))}
        </ul>

        <VisuallyHidden>
          <table>
            <caption>Share of your top genres among watched and favorite movies</caption>
            <tbody>
              {slices.map((slice) => (
                <tr key={slice.label}>
                  <th scope="row">{slice.label}</th>
                  <td>
                    {percentOf(slice.count, total)}% ({slice.count})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </VisuallyHidden>
      </div>
    </div>
  );
}
