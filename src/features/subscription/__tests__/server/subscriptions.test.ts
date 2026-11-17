import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import {
  getSubscriptionIdFromInvoice,
  getSubscriptionIdFromSession,
} from "@/features/subscription/server/subscriptions";

// Only the fields these helpers read; Stripe objects are large and mostly irrelevant here.
const session = (subscription: Stripe.Checkout.Session["subscription"]) =>
  ({ subscription }) as Stripe.Checkout.Session;

const invoice = (subscription: string | null) =>
  ({
    parent: subscription ? { subscription_details: { subscription } } : null,
  }) as unknown as Stripe.Invoice;

describe("getSubscriptionIdFromSession", () => {
  it("reads an unexpanded subscription ID", () => {
    expect(getSubscriptionIdFromSession(session("sub_123"))).toBe("sub_123");
  });

  it("reads an expanded subscription object", () => {
    expect(getSubscriptionIdFromSession(session({ id: "sub_456" } as Stripe.Subscription))).toBe(
      "sub_456",
    );
  });

  it("returns null for one-time payments", () => {
    expect(getSubscriptionIdFromSession(session(null))).toBeNull();
  });
});

describe("getSubscriptionIdFromInvoice", () => {
  it("reads the subscription from the invoice parent (API version 2025-03-31 and later)", () => {
    expect(getSubscriptionIdFromInvoice(invoice("sub_789"))).toBe("sub_789");
  });

  it("returns null for invoices that don't belong to a subscription", () => {
    expect(getSubscriptionIdFromInvoice(invoice(null))).toBeNull();
  });
});
