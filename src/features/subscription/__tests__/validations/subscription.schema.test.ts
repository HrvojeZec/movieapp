import { describe, expect, it } from "vitest";
import {
  checkoutSessionSchema,
  checkoutSuccessSchema,
} from "@/features/subscription/validations/subscription.schema";

describe("checkoutSessionSchema", () => {
  it.each(["premium", "pro"])("accepts the %s plan", (plan) => {
    expect(checkoutSessionSchema.safeParse({ plan }).success).toBe(true);
  });

  it("does not accept a price ID, so clients can't pick an arbitrary price", () => {
    expect(checkoutSessionSchema.safeParse({ plan: "price_123" }).success).toBe(false);
  });

  it.each(["basic", "", undefined])("rejects %j", (plan) => {
    expect(checkoutSessionSchema.safeParse({ plan }).success).toBe(false);
  });
});

describe("checkoutSuccessSchema", () => {
  it("accepts a Checkout Session ID", () => {
    expect(checkoutSuccessSchema.safeParse({ sessionId: "cs_test_a1b2c3" }).success).toBe(true);
  });

  it.each(["", "pi_123", "sub_123"])("rejects %j", (sessionId) => {
    expect(checkoutSuccessSchema.safeParse({ sessionId }).success).toBe(false);
  });
});
