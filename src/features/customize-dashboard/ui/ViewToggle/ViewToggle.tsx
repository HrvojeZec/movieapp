"use client";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { ChartColumnBig, Table2 } from "lucide-react";
import type { WidgetView } from "@/entities/stats/types";
import classes from "./ViewToggle.module.scss";

const OPTIONS: { view: WidgetView; label: string; icon: typeof Table2 }[] = [
  { view: "chart", label: "Show as chart", icon: ChartColumnBig },
  { view: "table", label: "Show as table", icon: Table2 },
];

interface ViewToggleProps {
  view: WidgetView;
  onChange: (view: WidgetView) => void;
}

/** Chart or table, in a widget's header. */
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    // On a header that drags the widget: pressing here must not pick it up
    <Group
      gap={2}
      wrap="nowrap"
      className={classes.toggle}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {OPTIONS.map(({ view: option, label, icon: Icon }) => (
        <Tooltip key={option} label={label}>
          <ActionIcon
            size="sm"
            variant={view === option ? "light" : "subtle"}
            color={view === option ? "blue" : "gray"}
            aria-label={label}
            aria-pressed={view === option}
            onClick={() => onChange(option)}
          >
            <Icon size={14} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  );
}
