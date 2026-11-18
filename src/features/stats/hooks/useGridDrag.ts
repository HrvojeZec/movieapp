import {
  useEffect,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  moveWidget,
  resizeWidget,
  stepWidget,
  type StepDirection,
} from "@/features/stats/lib/grid-layout";
import {
  describePosition,
  pointerToCell,
  sizeFromDelta,
  type GridMetrics,
} from "@/features/stats/lib/grid-drag";
import type { LayoutItem, WidgetType } from "@/features/stats/types";

interface PointerDrag {
  type: WidgetType;
  mode: "move" | "resize";
  origin: LayoutItem;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

interface KeyboardDrag {
  type: WidgetType;
  layout: LayoutItem[];
}

const ARROWS: Record<string, StepDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const findItem = (layout: LayoutItem[], type: WidgetType) =>
  layout.find((item) => item.type === type)!;

interface UseGridDragOptions {
  layout: LayoutItem[];
  metrics: GridMetrics;
  titleOf: (type: WidgetType) => string;
  onCommit: (layout: LayoutItem[]) => void;
}

/**
 * Moving and resizing widgets with a pointer (the widget follows it, the others make room) or
 * with the keyboard (Enter picks up, arrows move, Shift + arrows resize, Enter drops, Escape
 * puts it back). `preview` is the layout to show while that happens.
 */
export function useGridDrag({ layout, metrics, titleOf, onCommit }: UseGridDragOptions) {
  const [pointer, setPointer] = useState<PointerDrag | null>(null);
  const [keyboard, setKeyboard] = useState<KeyboardDrag | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const pointerPreview = (drag: PointerDrag) => {
    const delta = { dx: drag.dx, dy: drag.dy, origin: drag.origin, ...metrics };
    if (drag.mode === "move") {
      const { x, y } = pointerToCell(delta);
      return moveWidget(layout, drag.type, x, y);
    }
    const { w, h } = sizeFromDelta(delta);
    return resizeWidget(layout, drag.type, w, h);
  };

  const preview = pointer ? pointerPreview(pointer) : (keyboard?.layout ?? null);
  const announce = (next: LayoutItem[], type: WidgetType, prefix = "") =>
    setAnnouncement(`${prefix}${describePosition(findItem(next, type), titleOf(type))}`);

  // Escape anywhere puts a dragged widget back
  useEffect(() => {
    if (!pointer) return;
    const cancel = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPointer(null);
    };
    window.addEventListener("keydown", cancel);
    return () => window.removeEventListener("keydown", cancel);
  }, [pointer]);

  const startPointer =
    (type: WidgetType, mode: PointerDrag["mode"]) => (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setKeyboard(null);
      setPointer({
        type,
        mode,
        origin: findItem(layout, type),
        startX: event.clientX,
        startY: event.clientY,
        dx: 0,
        dy: 0,
      });
    };

  const pointerHandlers = (type: WidgetType, mode: PointerDrag["mode"]) => ({
    onPointerDown: startPointer(type, mode),
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      if (pointer?.type !== type) return;
      setPointer({
        ...pointer,
        dx: event.clientX - pointer.startX,
        dy: event.clientY - pointer.startY,
      });
    },
    onPointerUp: () => {
      if (pointer?.type !== type) return;
      const next = pointerPreview(pointer);
      setPointer(null);
      announce(next, type, "Dropped. ");
      onCommit(next);
    },
    onPointerCancel: () => setPointer(null),
  });

  const keyboardProps = (type: WidgetType) => ({
    "aria-pressed": keyboard?.type === type,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const held = keyboard?.type === type ? keyboard : null;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (held) {
          setKeyboard(null);
          announce(held.layout, type, "Dropped. ");
          onCommit(held.layout);
        } else {
          setKeyboard({ type, layout });
          announce(layout, type, "Picked up. ");
        }
        return;
      }
      if (!held) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setKeyboard(null);
        announce(layout, type, "Cancelled. ");
        return;
      }
      const direction = ARROWS[event.key];
      if (!direction) return;
      event.preventDefault();
      let next: LayoutItem[];
      if (event.shiftKey) {
        const item = findItem(held.layout, type);
        const dw = direction === "right" ? 1 : direction === "left" ? -1 : 0;
        const dh = direction === "down" ? 1 : direction === "up" ? -1 : 0;
        next = resizeWidget(held.layout, type, item.w + dw, item.h + dh);
      } else {
        next = stepWidget(held.layout, type, direction);
      }
      setKeyboard({ type, layout: next });
      announce(next, type);
    },
    // Leaving the handle drops nothing: the widget goes back where it was
    onBlur: () => {
      if (keyboard?.type === type) setKeyboard(null);
    },
  });

  return {
    preview,
    /** The widget following the pointer, with how far it has moved. */
    dragging: pointer?.mode === "move" ? pointer : null,
    activeType: pointer?.type ?? keyboard?.type ?? null,
    /** On the widget header: dragging it moves the widget. */
    dragProps: (type: WidgetType) => pointerHandlers(type, "move"),
    /** On the handle button: the keyboard way to move and resize. */
    keyboardProps,
    resizeProps: (type: WidgetType) => pointerHandlers(type, "resize"),
    announcement,
  };
}
