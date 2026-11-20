import { Text, ThemeIcon, type MantineColor } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import { linePath } from "@/entities/stats/lib/chart-geometry";
import { RollingNumber } from "@/shared/ui/motion/RollingNumber/RollingNumber";
import classes from "./StatTile.module.scss";

// From this many rows a tile has room for a bigger number
const LARGE_TILE_ROWS = 3;
// The sparkline is drawn in a 100 × 30 box stretched to the tile's width
const SPARK_WIDTH = 100;
const SPARK_HEIGHT = 30;
const BADGE_SIZE = 36;
const BADGE_ICON_SIZE = 18;
// The same icon, large and faint, fills the tile's corner
const WATERMARK_SIZE = 110;

interface StatTileProps {
  value: number;
  label: string;
  size: { w: number; h: number };
  /** What the number counts, e.g. the heart for favorites. */
  icon: LucideIcon;
  color: MantineColor;
  /** Monthly values for a small trend line under the number (larger tiles only). */
  trend?: number[];
}

/**
 * One total in big digits that roll into place, under an icon in the total's color, with the
 * icon again as a faint watermark and an optional trend line.
 */
export function StatTile({ value, label, size, icon: Icon, color, trend }: StatTileProps) {
  const spark =
    trend && trend.some((point) => point > 0) ? linePath(trend, SPARK_WIDTH, SPARK_HEIGHT) : null;

  return (
    <div className={classes.tile} data-large={size.h >= LARGE_TILE_ROWS || undefined}>
      <Icon size={WATERMARK_SIZE} className={classes.watermark} aria-hidden />
      <ThemeIcon
        variant="light"
        color={color}
        size={BADGE_SIZE}
        radius="md"
        className={classes.badge}
      >
        <Icon size={BADGE_ICON_SIZE} aria-hidden />
      </ThemeIcon>
      <div>
        <Text component="span" className={classes.value} c="white" fw={700}>
          <RollingNumber value={value} />
        </Text>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </div>
      {spark && (
        // The number already says it; the line only shows the shape of the last months
        <svg
          viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
          preserveAspectRatio="none"
          className={classes.spark}
          aria-hidden
        >
          <path d={spark.area} className={classes.sparkArea} />
          <path d={spark.line} className={classes.sparkLine} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  );
}
