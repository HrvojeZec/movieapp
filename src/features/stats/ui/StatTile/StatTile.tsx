import { Text } from "@mantine/core";
import { RollingNumber } from "@/shared/ui/motion/RollingNumber/RollingNumber";
import classes from "./StatTile.module.scss";

// From this many rows a tile has room for a bigger number
const LARGE_TILE_ROWS = 3;

interface StatTileProps {
  value: number;
  label: string;
  size: { w: number; h: number };
}

/** One total in big digits that roll into place. */
export function StatTile({ value, label, size }: StatTileProps) {
  return (
    <div className={classes.tile} data-large={size.h >= LARGE_TILE_ROWS || undefined}>
      <Text component="span" className={classes.value} c="white" fw={700}>
        <RollingNumber value={value} />
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </div>
  );
}
