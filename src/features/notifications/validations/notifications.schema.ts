import { z } from "zod";
import { MARK_READ_MAX_IDS } from "@/features/notifications/constants";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid notification ID");

// Either the notifications the user opened, or all of them ("Mark all as read")
export const markReadSchema = z.union([
  z.object({ ids: z.array(objectId).min(1).max(MARK_READ_MAX_IDS) }),
  z.object({ all: z.literal(true) }),
]);

export type MarkReadSelection = z.infer<typeof markReadSchema>;
