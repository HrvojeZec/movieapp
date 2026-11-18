import {
  GRID_COLUMNS,
  PHONE_GRID_COLUMNS,
  TABLET_GRID_COLUMNS,
  WIDGET_SIZES,
  WIDGET_TYPES,
} from "@/features/stats/constants";
import type { LayoutItem, WidgetType } from "@/features/stats/types";

type Columns = typeof GRID_COLUMNS | typeof TABLET_GRID_COLUMNS | typeof PHONE_GRID_COLUMNS;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const byPosition = (a: LayoutItem, b: LayoutItem) => a.y - b.y || a.x - b.x;

const sorted = (layout: readonly LayoutItem[]) => [...layout].sort(byPosition);

const collides = (a: LayoutItem, b: LayoutItem) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const collidesWithAny = (item: LayoutItem, placed: readonly LayoutItem[]) =>
  placed.some((other) => collides(item, other));

export function hasOverlap(layout: readonly LayoutItem[]): boolean {
  return layout.some((item, index) =>
    layout.slice(index + 1).some((other) => collides(item, other)),
  );
}

const sharesColumns = (a: LayoutItem, b: LayoutItem) => a.x < b.x + b.w && b.x < a.x + a.w;

const bottomOf = (item: LayoutItem) => item.y + item.h;

// Rises to the nearest widget above it in its columns, or sinks below everything it overlaps,
// so a widget never jumps over another one. Jumps instead of stepping row by row because a
// saved y can be arbitrarily large.
function settle(item: LayoutItem, placed: readonly LayoutItem[]): LayoutItem {
  let next = { ...item, y: Math.max(0, item.y) };
  if (!collidesWithAny(next, placed)) {
    const above = placed.filter((other) => sharesColumns(next, other) && bottomOf(other) <= next.y);
    return { ...next, y: Math.max(0, ...above.map(bottomOf)) };
  }
  for (;;) {
    const overlapping = placed.filter((other) => collides(next, other));
    if (overlapping.length === 0) return next;
    next = { ...next, y: Math.max(...overlapping.map(bottomOf)) };
  }
}

function pack(layout: readonly LayoutItem[], pinned?: LayoutItem): LayoutItem[] {
  const placed: LayoutItem[] = pinned ? [{ ...pinned }] : [];
  for (const item of sorted(layout)) {
    if (item.type !== pinned?.type) placed.push(settle(item, placed));
  }
  return sorted(placed);
}

export function compact(layout: readonly LayoutItem[]): LayoutItem[] {
  return pack(layout);
}

// The changed widget keeps its cell while the others make room, then everything settles
function withPriority(layout: readonly LayoutItem[], changed: LayoutItem): LayoutItem[] {
  return compact(pack(layout, changed));
}

export function moveWidget(
  layout: readonly LayoutItem[],
  type: WidgetType,
  x: number,
  y: number,
): LayoutItem[] {
  const item = layout.find((candidate) => candidate.type === type);
  if (!item) return compact(layout);
  return withPriority(layout, {
    ...item,
    x: clamp(x, 0, GRID_COLUMNS - item.w),
    y: Math.max(0, y),
  });
}

export function resizeWidget(
  layout: readonly LayoutItem[],
  type: WidgetType,
  w: number,
  h: number,
): LayoutItem[] {
  const item = layout.find((candidate) => candidate.type === type);
  if (!item) return compact(layout);
  const { min, max } = WIDGET_SIZES[type];
  // Grows only up to the right edge; a minimum that doesn't fit shifts the widget left
  const width = Math.max(min[0], Math.min(clamp(w, min[0], max[0]), GRID_COLUMNS - item.x));
  return withPriority(layout, {
    ...item,
    x: Math.min(item.x, GRID_COLUMNS - width),
    w: width,
    h: clamp(h, min[1], max[1]),
  });
}

export function addWidget(layout: readonly LayoutItem[], type: WidgetType): LayoutItem[] {
  const packed = compact(layout);
  if (packed.some((item) => item.type === type)) return packed;
  const [w, h] = WIDGET_SIZES[type].default;
  // Packed, the board ends at its lowest bottom edge, so the scan always finds a spot there
  for (let y = 0; ; y += 1) {
    for (let x = 0; x + w <= GRID_COLUMNS; x += 1) {
      const candidate = { type, x, y, w, h };
      if (!collidesWithAny(candidate, packed)) return compact([...packed, candidate]);
    }
  }
}

export function removeWidget(layout: readonly LayoutItem[], type: WidgetType): LayoutItem[] {
  return compact(layout.filter((item) => item.type !== type));
}

// Halving both edges with the same rounding keeps side-by-side widgets from overlapping
const halveEdge = (edge: number) => Math.round(edge / 2);

export function toColumns(layout: readonly LayoutItem[], columns: Columns): LayoutItem[] {
  if (columns === GRID_COLUMNS) return compact(layout);
  if (columns === TABLET_GRID_COLUMNS) {
    return compact(
      layout.map((item) => {
        const w = clamp(halveEdge(item.x + item.w) - halveEdge(item.x), 1, TABLET_GRID_COLUMNS);
        return { ...item, w, x: Math.min(halveEdge(item.x), TABLET_GRID_COLUMNS - w) };
      }),
    );
  }
  let y = 0;
  return sorted(layout).map((item) => {
    const stacked = { ...item, x: 0, y, w: PHONE_GRID_COLUMNS };
    y += item.h;
    return stacked;
  });
}

const KNOWN_TYPES = new Set<string>(WIDGET_TYPES);

const wholeOr = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.round(value) : fallback;

// Saved layouts can come from an older version: drop what no longer exists and fit the rest
export function sanitizeLayout(items: readonly LayoutItem[]): LayoutItem[] {
  const seen = new Set<WidgetType>();
  const valid: LayoutItem[] = [];
  for (const item of items) {
    if (!KNOWN_TYPES.has(item.type) || seen.has(item.type)) continue;
    seen.add(item.type);
    const { min, max, default: size } = WIDGET_SIZES[item.type];
    const w = clamp(wholeOr(item.w, size[0]), min[0], Math.min(max[0], GRID_COLUMNS));
    valid.push({
      type: item.type,
      x: clamp(wholeOr(item.x, 0), 0, GRID_COLUMNS - w),
      y: Math.max(0, wholeOr(item.y, 0)),
      w,
      h: clamp(wholeOr(item.h, size[1]), min[1], max[1]),
    });
  }
  return compact(valid);
}
