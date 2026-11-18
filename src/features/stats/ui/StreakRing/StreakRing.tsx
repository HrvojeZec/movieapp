"use client";
import { Text } from "@mantine/core";
import { motion, useReducedMotion } from "motion/react";
import type { Streak } from "@/features/stats/types";
import { pluralize } from "@/shared/lib/format";
import { SPRINGS } from "@/shared/ui/motion/motion.constants";
import { RollingNumber } from "@/shared/ui/motion/RollingNumber/RollingNumber";
import classes from "./StreakRing.module.scss";

const RADIUS = 42;
const STROKE = 8;
const SIZE = (RADIUS + STROKE) * 2;

/**
 * The current run of active days as a ring that fills towards the longest run; matching the
 * record closes the ring and it flashes once.
 */
export function StreakRing({ current, longest }: Streak) {
  const reduceMotion = useReducedMotion();

  if (longest === 0) {
    return (
      <Text c="dimmed" size="sm">
        Open a movie or mark one as watched to start a streak of active days.
      </Text>
    );
  }

  const record = current > 0 && current === longest;
  const center = SIZE / 2;

  return (
    <div className={classes.streak}>
      <div className={classes.chart}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={classes.ring} aria-hidden>
          <circle cx={center} cy={center} r={RADIUS} className={classes.track} />
          <motion.circle
            cx={center}
            cy={center}
            r={RADIUS}
            className={classes.progress}
            data-record={record || undefined}
            // Starts at 12 o'clock and runs clockwise
            transform={`rotate(-90 ${center} ${center})`}
            initial={reduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: current / longest }}
            viewport={{ once: true }}
            transition={SPRINGS.gentle}
          />
        </svg>
        <div className={classes.center}>
          <Text component="span" fw={700} c="white" className={classes.days}>
            <RollingNumber value={current} />
          </Text>
          <Text component="span" size="xs" c="dimmed">
            {pluralize(current, "day")} in a row
          </Text>
        </div>
      </div>
      <Text size="sm" c="dimmed" ta="center">
        {record ? "Your longest streak yet" : `Longest: ${longest} ${pluralize(longest, "day")}`}
      </Text>
    </div>
  );
}
