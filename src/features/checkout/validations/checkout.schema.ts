import { z } from "zod";
import { BILLING_INTERVALS, PAID_PLANS } from "@/entities/subscription/constants";

export const checkoutSessionSchema = z.object({
  plan: z.enum(PAID_PLANS),
  interval: z.enum(BILLING_INTERVALS).default("month"),
});

export const checkoutSuccessSchema = z.object({
  sessionId: z.string().startsWith("cs_", "Invalid checkout session ID"),
});
