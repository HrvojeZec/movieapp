"use client";
import { Text, Tooltip, VisuallyHidden } from "@mantine/core";
import classes from "./ColumnChart.module.scss";

interface ColumnChartProps {
  /** Names the chart for screen readers; the visible title sits above it. */
  label: string;
  columns: { key: string; shortLabel: string; fullLabel: string; value: number }[];
  /** e.g. ["movie watched", "movies watched"] for the tooltip and the table */
  unit: [string, string];
}

const describe = (value: number, [singular, plural]: [string, string]) =>
  `${value} ${value === 1 ? singular : plural}`;

/**
 * Vertical columns over time with one series: one color, no legend. The top of the scale is
 * written above the plot; hovering a column (its full height is the target) shows its value.
 * It fills the height it is given.
 */
export function ColumnChart({ label, columns, unit }: ColumnChartProps) {
  const max = Math.max(...columns.map((column) => column.value));

  return (
    <div className={classes.chart}>
      <div aria-hidden className={classes.figure}>
        <Text size="xs" c="dimmed" className={classes.scale}>
          {max > 0 ? max : ""}
        </Text>
        <div className={classes.plot}>
          {columns.map((column) => (
            <Tooltip
              key={column.key}
              label={`${column.fullLabel}: ${describe(column.value, unit)}`}
            >
              <div className={classes.column}>
                <div
                  className={classes.bar}
                  style={{ height: max > 0 ? `${(column.value / max) * 100}%` : 0 }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
        <div className={classes.labels}>
          {columns.map((column) => (
            <Text key={column.key} size="xs" c="dimmed" ta="center" className={classes.label}>
              {column.shortLabel}
            </Text>
          ))}
        </div>
      </div>

      <VisuallyHidden>
        <table>
          <caption>{label}</caption>
          <tbody>
            {columns.map((column) => (
              <tr key={column.key}>
                <th scope="row">{column.fullLabel}</th>
                <td>{describe(column.value, unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
}
