import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { animate, useReducedMotion, type MotionValue } from "motion/react";
import {
  cellToPixels,
  clampFrameSize,
  rubberBand,
  describePosition,
  pointerToCell,
  sizeFromDelta,
  type GridMetrics,
} from "@/entities/stats/lib/grid-drag";
import {
  planMove,
  resizeWidget,
  stepWidget,
  type StepDirection,
} from "@/entities/stats/lib/grid-layout";
import type { LayoutItem, WidgetType } from "@/entities/stats/types";
import {
  DRAG_TILT_MAX_DEG,
  DRAG_TILT_PER_VELOCITY,
  LIFT_SCALE,
  SPRINGS,
} from "@/shared/ui/motion/motion.constants";

/** The motion values a grid cell is drawn with; a gesture moves them directly. */
export interface CellMotion {
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
}

type Mode = "move" | "resize";

/** What React needs to know about a gesture: only the cell it currently aims at. */
type Gesture =
  | { input: "pointer"; type: WidgetType; mode: "move"; x: number; y: number }
  | { input: "pointer"; type: WidgetType; mode: "resize"; w: number; h: number; atLimit: boolean }
  | { input: "keyboard"; type: WidgetType; layout: LayoutItem[] };

/** Everything else about a pointer gesture, kept out of React so moves don't re-render. */
interface PointerGesture {
  type: WidgetType;
  mode: Mode;
  values: CellMotion;
  origin: LayoutItem;
  originPixels: ReturnType<typeof cellToPixels>;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  target: Gesture;
  /** The widget's frame, shaken when a spot is refused. */
  frame: HTMLElement | null;
  blocked: boolean;
  onKey: (event: globalThis.KeyboardEvent) => void;
}

const ARROWS: Record<string, StepDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const MS_PER_SECOND = 1000;
// A short "no": the frame shakes sideways, the shake dying down
const SHAKE_KEYFRAMES = [0, -6, 5, -3, 2, 0].map((px) => ({ transform: `translateX(${px}px)` }));
const SHAKE_MS = 320;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const findItem = (layout: LayoutItem[], type: WidgetType) =>
  layout.find((item) => item.type === type)!;

const sameTarget = (a: Gesture, b: Gesture) =>
  a.input === "pointer" &&
  b.input === "pointer" &&
  (a.mode === "move" && b.mode === "move"
    ? a.x === b.x && a.y === b.y
    : a.mode === "resize" &&
      b.mode === "resize" &&
      a.w === b.w &&
      a.h === b.h &&
      a.atLimit === b.atLimit);

/** The layout a gesture aims at, from the engine, and whether its spot is refused. */
function planOf(
  layout: LayoutItem[],
  gesture: Gesture | null,
): { layout: LayoutItem[]; blocked: boolean } | null {
  if (!gesture) return null;
  if (gesture.input === "keyboard") return { layout: gesture.layout, blocked: false };
  return gesture.mode === "move"
    ? planMove(layout, gesture.type, gesture.x, gesture.y)
    : { layout: resizeWidget(layout, gesture.type, gesture.w, gesture.h), blocked: false };
}

interface UseGridDragOptions {
  layout: LayoutItem[];
  metrics: GridMetrics;
  titleOf: (type: WidgetType) => string;
  onCommit: (layout: LayoutItem[]) => void;
}

/**
 * Moving and resizing widgets with a pointer or the keyboard. A pointer gesture drives the
 * widget's own motion values on every move (it follows the pointer exactly, leaning into its
 * direction); React only hears about it when the widget aims at another cell, so the board
 * re-renders a handful of times per drag instead of on every move.
 */
export function useGridDrag({ layout, metrics, titleOf, onCommit }: UseGridDragOptions) {
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [landingType, setLandingType] = useState<WidgetType | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const reduceMotion = useReducedMotion();
  const pointer = useRef<PointerGesture | null>(null);

  // The board can go away mid-drag (a link, a shortcut): the page-wide traces must go with it
  useEffect(
    () => () => {
      const current = pointer.current;
      if (!current) return;
      window.removeEventListener("keydown", current.onKey);
      delete document.documentElement.dataset.dragging;
    },
    [],
  );

  const plan = planOf(layout, gesture);
  const preview = plan?.layout ?? null;

  const shake = (frame: HTMLElement | null) => {
    if (frame && !reduceMotion)
      frame.animate(SHAKE_KEYFRAMES, { duration: SHAKE_MS, easing: "ease-out" });
  };
  const announce = (next: LayoutItem[], type: WidgetType, prefix = "") =>
    setAnnouncement(`${prefix}${describePosition(findItem(next, type), titleOf(type))}`);

  const endPointer = (commit: boolean) => {
    const current = pointer.current;
    if (!current) return;
    pointer.current = null;
    window.removeEventListener("keydown", current.onKey);
    delete document.documentElement.dataset.dragging;
    if (commit) {
      const { layout: next, blocked } = planOf(layout, current.target)!;
      if (blocked) {
        // Let go on a spot it can't take: it goes back, with a little shake that says so
        shake(current.frame);
        setAnnouncement("Can't move there.");
        setLandingType(current.type);
        setGesture(null);
        return;
      }
      const moved = findItem(next, current.type);
      const { origin } = current;
      if (
        moved.x !== origin.x ||
        moved.y !== origin.y ||
        moved.w !== origin.w ||
        moved.h !== origin.h
      ) {
        onCommit(next);
      }
      announce(next, current.type, "Dropped. ");
    }
    // The cell takes over again and springs to its place (back to where it was, when cancelled)
    setLandingType(current.type);
    setGesture(null);
  };

  const startPointer =
    (type: WidgetType, mode: Mode, values: CellMotion) =>
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0 || pointer.current) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const origin = findItem(layout, type);
      const target: Gesture =
        mode === "move"
          ? { input: "pointer", type, mode, x: origin.x, y: origin.y }
          : { input: "pointer", type, mode, w: origin.w, h: origin.h, atLimit: false };
      const onKey = (keyEvent: globalThis.KeyboardEvent) => {
        if (keyEvent.key === "Escape") endPointer(false);
      };
      window.addEventListener("keydown", onKey);
      document.documentElement.dataset.dragging = mode;
      pointer.current = {
        type,
        mode,
        values,
        origin,
        originPixels: cellToPixels(origin, metrics),
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        target,
        frame: event.currentTarget.closest<HTMLElement>("[data-widget-frame]"),
        blocked: false,
        onKey,
      };
      if (!reduceMotion) animate(values.scale, LIFT_SCALE, SPRINGS.snappy);
      setGesture(target);
    };

  const movePointer = (type: WidgetType) => (event: ReactPointerEvent<HTMLElement>) => {
    const current = pointer.current;
    if (!current || current.type !== type) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    const { values, origin, originPixels } = current;
    let target: Gesture;

    if (current.mode === "move") {
      values.x.set(originPixels.left + dx);
      values.y.set(originPixels.top + dy);
      if (!reduceMotion) {
        const elapsed = Math.max(1, event.timeStamp - current.lastTime);
        const speed = ((event.clientX - current.lastX) / elapsed) * MS_PER_SECOND;
        const lean = clamp(speed * DRAG_TILT_PER_VELOCITY, -DRAG_TILT_MAX_DEG, DRAG_TILT_MAX_DEG);
        animate(values.rotate, lean, SPRINGS.snappy);
      }
      const cell = pointerToCell({ dx, dy, origin, ...metrics });
      target = { input: "pointer", type, mode: "move", ...cell };
    } else {
      const wanted = { width: originPixels.width + dx, height: originPixels.height + dy };
      const size = clampFrameSize(origin, wanted, metrics);
      const atLimit = size.width !== wanted.width || size.height !== wanted.height;
      // Past a limit the frame gives a little and stiffens, so the limit is felt
      values.width.set(reduceMotion ? size.width : rubberBand(wanted.width, size.width));
      values.height.set(reduceMotion ? size.height : rubberBand(wanted.height, size.height));
      const cells = sizeFromDelta({ dx, dy, origin, ...metrics });
      target = { input: "pointer", type, mode: "resize", ...cells, atLimit };
    }

    current.lastX = event.clientX;
    current.lastTime = event.timeStamp;
    if (!sameTarget(target, current.target)) {
      current.target = target;
      // Only when the aimed-at cell changes: the engine works out where the widget would land
      if (target.mode === "move") {
        const { blocked } = planMove(layout, type, target.x, target.y);
        if (blocked && !current.blocked) shake(current.frame);
        current.blocked = blocked;
      }
      setGesture(target);
    }
  };

  const pointerHandlers = (type: WidgetType, mode: Mode, values: CellMotion) => ({
    onPointerDown: startPointer(type, mode, values),
    onPointerMove: movePointer(type),
    onPointerUp: () => {
      if (pointer.current?.type === type) endPointer(true);
    },
    // The browser took the pointer away (a system gesture, the window lost focus): put it back
    onPointerCancel: () => endPointer(false),
    onLostPointerCapture: () => endPointer(false),
  });

  const keyboard = gesture?.input === "keyboard" ? gesture : null;

  const keyboardProps = (type: WidgetType) => ({
    "aria-pressed": keyboard?.type === type,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const held = keyboard?.type === type ? keyboard : null;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (held) {
          setGesture(null);
          announce(held.layout, type, "Dropped. ");
          onCommit(held.layout);
        } else {
          setGesture({ input: "keyboard", type, layout });
          announce(layout, type, "Picked up. ");
        }
        return;
      }
      if (!held) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setGesture(null);
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
      setGesture({ input: "keyboard", type, layout: next });
      announce(next, type);
    },
    // Leaving the handle drops nothing: the widget goes back where it was
    onBlur: () => {
      if (keyboard?.type === type) setGesture(null);
    },
  });

  const pointerGesture = gesture?.input === "pointer" ? gesture : null;

  return {
    /** The layout to show while a gesture is under way. */
    preview,
    /** Where the pointer aims when the widget can't go there (shown as a refused spot). */
    refused:
      pointerGesture?.mode === "move" && plan?.blocked
        ? { type: pointerGesture.type, x: pointerGesture.x, y: pointerGesture.y }
        : null,
    /** A resize pulled past the widget's size limit. */
    atLimit:
      pointerGesture?.mode === "resize" && pointerGesture.atLimit ? pointerGesture.type : null,
    /** The widget the pointer is moving or resizing; its cell follows the pointer, not the layout. */
    pointerType: gesture?.input === "pointer" ? gesture.type : null,
    pointerMode: gesture?.input === "pointer" ? gesture.mode : null,
    /** The widget being moved by any means, drawn above the others. */
    activeType: gesture?.type ?? null,
    /** The widget last let go of, kept on top while it lands. */
    landingType,
    /** On the widget header: dragging it moves the widget. */
    dragProps: (type: WidgetType, values: CellMotion) => pointerHandlers(type, "move", values),
    /** On the corner handle: dragging it resizes the widget. */
    resizeProps: (type: WidgetType, values: CellMotion) => pointerHandlers(type, "resize", values),
    /** On the handle button: the keyboard way to move and resize. */
    keyboardProps,
    announcement,
  };
}
