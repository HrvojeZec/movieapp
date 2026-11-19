"use client";
import type { HTMLAttributes, ReactNode } from "react";
import { ActionIcon, Group, Paper, Title } from "@mantine/core";
import { ArrowDown, ArrowUp, GripVertical, MoveDiagonal2, X } from "lucide-react";
import classes from "./WidgetFrame.module.scss";

export interface WidgetEditControls {
  /** Pointer handlers that move the widget by its header (wide boards only). */
  dragProps?: HTMLAttributes<HTMLElement>;
  /** Keyboard handlers for the grip button (wide boards only). */
  keyboardProps?: HTMLAttributes<HTMLElement> & { "aria-pressed"?: boolean };
  resizeProps?: HTMLAttributes<HTMLElement>;
  /** Narrow boards move widgets with buttons instead of dragging. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  instructionsId: string;
}

interface WidgetFrameProps {
  title: string;
  icon: ReactNode;
  /** Tiles show their label in the body, so outside editing they have no header. */
  bare?: boolean;
  /** Present while the board is being customized. */
  edit?: WidgetEditControls;
  active?: boolean;
  /** Extra controls in the header, shown in and out of editing (e.g. chart or table). */
  actions?: ReactNode;
  children: ReactNode;
}

export function WidgetFrame({
  title,
  icon,
  bare,
  edit,
  active,
  actions,
  children,
}: WidgetFrameProps) {
  const showHeader = !bare || Boolean(edit);

  return (
    <Paper
      p="md"
      className={classes.frame}
      data-editing={edit ? true : undefined}
      data-active={active || undefined}
    >
      {showHeader && (
        <div
          className={classes.header}
          data-draggable={edit?.dragProps ? true : undefined}
          data-drag-handle={edit?.dragProps ? true : undefined}
          {...edit?.dragProps}
        >
          <Group gap={8} wrap="nowrap" className={classes.title}>
            {icon}
            <Title order={2} size="h5" c="white" lineClamp={1}>
              {title}
            </Title>
          </Group>
          {actions}
          {edit && (
            // Buttons inside the header must not start a drag
            <Group
              gap={4}
              wrap="nowrap"
              className={classes.controls}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {edit.keyboardProps && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Move ${title}`}
                  aria-describedby={edit.instructionsId}
                  className={classes.grip}
                  {...edit.keyboardProps}
                >
                  <GripVertical size={16} />
                </ActionIcon>
              )}
              {edit.onMoveUp && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Move ${title} up`}
                  onClick={edit.onMoveUp}
                >
                  <ArrowUp size={16} />
                </ActionIcon>
              )}
              {edit.onMoveDown && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Move ${title} down`}
                  onClick={edit.onMoveDown}
                >
                  <ArrowDown size={16} />
                </ActionIcon>
              )}
              {edit.onRemove && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={`Remove ${title}`}
                  onClick={edit.onRemove}
                >
                  <X size={16} />
                </ActionIcon>
              )}
            </Group>
          )}
        </div>
      )}
      <div className={classes.body} data-widget-body>
        {children}
      </div>
      {edit?.resizeProps && (
        <div className={classes.resize} title={`Resize ${title}`} aria-hidden {...edit.resizeProps}>
          <MoveDiagonal2 size={14} />
        </div>
      )}
    </Paper>
  );
}
