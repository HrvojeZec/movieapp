"use client";
import { useState } from "react";
import { Group, SegmentedControl } from "@mantine/core";
import { ColumnChart, type ColumnChartProps } from "@/entities/stats/ui/ColumnChart/ColumnChart";
import classes from "./WatchedMonthly.module.scss";

const RANGES = [
  { label: "6 mo", value: "6" },
  { label: "12 mo", value: "12" },
];

/** Movies watched per month, with a switch between the last 6 and 12 months. */
export function WatchedMonthly({ columns, unit }: Pick<ColumnChartProps, "columns" | "unit">) {
  const [months, setMonths] = useState("12");
  const count = Number(months);

  return (
    <div className={classes.monthly}>
      <Group justify="flex-end">
        <SegmentedControl
          size="xs"
          data={RANGES}
          value={months}
          onChange={setMonths}
          aria-label="Months shown"
        />
      </Group>
      <div className={classes.chart}>
        <ColumnChart
          label={`Movies watched per month, last ${count} months`}
          columns={columns.slice(-count)}
          unit={unit}
        />
      </div>
    </div>
  );
}
