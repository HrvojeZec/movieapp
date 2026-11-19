"use client";
import { ActionIcon, Tooltip } from "@mantine/core";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebarWide } from "./useSidebarWide";

export const SIDEBAR_TOGGLE_ATTRIBUTE = "data-sidebar-toggle";

/** The header button that collapses and expands the sidebar; it never moves. */
export function SidebarToggle() {
  const { wide, toggle } = useSidebarWide();
  const label = wide ? "Collapse sidebar" : "Expand sidebar";
  const Icon = wide ? PanelLeftClose : PanelLeftOpen;

  return (
    <Tooltip label={label} position="bottom" withArrow>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        onClick={toggle}
        aria-expanded={wide}
        aria-label={label}
        {...{ [SIDEBAR_TOGGLE_ATTRIBUTE]: "" }}
      >
        <Icon size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
