"use client";
import { Box, Text, Tooltip, VisuallyHidden } from "@mantine/core";
import classes from "./BarList.module.scss";

interface BarListProps {
  /** Names the chart for screen readers; the visible title sits above it. */
  label: string;
  items: { key: string | number; label: string; value: number }[];
  /** e.g. ["movie", "movies"] for the tooltip and the table */
  unit: [string, string];
}

const describe = (value: number, [singular, plural]: [string, string]) =>
  `${value} ${value === 1 ? singular : plural}`;

/**
 * Horizontal bars, one row per item, longest first: a single series, so one color and no legend.
 * Names and values are text beside the bar; hovering a row shows it in full.
 */
export function BarList({ label, items, unit }: BarListProps) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <div>
      <div className={classes.list} aria-hidden>
        {items.map((item) => (
          <Tooltip key={item.key} label={`${item.label}: ${describe(item.value, unit)}`}>
            {/* The whole row is the hover target, not just the bar */}
            <div className={classes.row}>
              <Text size="sm" c="gray.3" truncate className={classes.name}>
                {item.label}
              </Text>
              <Box className={classes.track}>
                <div className={classes.bar} style={{ width: `${(item.value / max) * 100}%` }} />
              </Box>
              <Text size="sm" c="dimmed" ta="right" className={classes.value}>
                {item.value}
              </Text>
            </div>
          </Tooltip>
        ))}
      </div>

      <VisuallyHidden>
        <table>
          <caption>{label}</caption>
          <tbody>
            {items.map((item) => (
              <tr key={item.key}>
                <th scope="row">{item.label}</th>
                <td>{describe(item.value, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
}
