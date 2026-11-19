import { z } from "zod";
import { WIDGET_TYPES, WIDGET_VIEWS } from "@/entities/stats/constants";

const cell = z.number().int();

const layoutItemSchema = z.object({
  type: z.enum(WIDGET_TYPES),
  x: cell.min(0),
  y: cell.min(0),
  w: cell.min(1),
  h: cell.min(1),
  view: z.enum(WIDGET_VIEWS).optional(),
});

/** A board from the client: the shape must be right; overlaps and packing are fixed on save. */
export const dashboardLayoutSchema = z.object({
  layout: z.array(layoutItemSchema).max(WIDGET_TYPES.length),
});
