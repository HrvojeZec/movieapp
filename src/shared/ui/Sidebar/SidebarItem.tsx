"use client";
import { useId } from "react";
import Link from "next/link";
import { Tooltip, UnstyledButton, VisuallyHidden } from "@mantine/core";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { SPRINGS } from "@/shared/ui/motion/motion.constants";
import type { SidebarLink } from "./sidebar-links";
import classes from "./Sidebar.module.scss";

interface SidebarItemProps {
  link: SidebarLink;
  active: boolean;
  /** The plan the link needs, when the user's plan doesn't include it. */
  lockedPlan: string | null;
  count?: number;
  /** Labels are showing, so the tooltip would only repeat them. */
  wide: boolean;
  onNavigate: () => void;
  onOpenSearch: () => void;
}

export function SidebarItem({
  link,
  active,
  lockedPlan,
  count = 0,
  wide,
  onNavigate,
  onOpenSearch,
}: SidebarItemProps) {
  const lockId = useId();
  const Icon = link.icon;

  const content = (
    <>
      {/* One pill for the whole sidebar: it slides from the old page's item to the new one */}
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className={classes.pill}
          transition={SPRINGS.snappy}
        />
      )}
      <span className={classes.icon}>
        <Icon size={20} />
        {count > 0 && (
          <span className={classes.count} data-count={count}>
            {count}
          </span>
        )}
        {lockedPlan && <Lock size={10} className={classes.lock} aria-hidden />}
      </span>
      <span className={classes.label}>{link.label}</span>
    </>
  );

  const item = link.opensSearch ? (
    <UnstyledButton className={classes.item} onClick={onOpenSearch}>
      {content}
    </UnstyledButton>
  ) : (
    <Link
      href={link.href}
      className={classes.item}
      aria-current={active ? "page" : undefined}
      aria-describedby={lockedPlan ? lockId : undefined}
      data-locked={lockedPlan ? true : undefined}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );

  return (
    <>
      <Tooltip
        label={lockedPlan ? `${link.label} · ${lockedPlan}` : link.label}
        position="right"
        withArrow
        disabled={wide && !lockedPlan}
      >
        {item}
      </Tooltip>
      {/* Outside the link: inside, it would become part of the link's name */}
      {lockedPlan && <VisuallyHidden id={lockId}>Needs the {lockedPlan} plan</VisuallyHidden>}
    </>
  );
}
