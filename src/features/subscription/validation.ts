import { z } from "zod";
import { PAID_PLANS } from "./plans";

export const checkoutSessionSchema = z.object({
  plan: z.enum(PAID_PLANS),
});

export const checkoutSuccessSchema = z.object({
  sessionId: z.string().startsWith("cs_", "Invalid checkout session ID"),
});
