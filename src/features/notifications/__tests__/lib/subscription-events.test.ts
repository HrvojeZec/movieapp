import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSubscriptionNotification } from "@/features/notifications/lib/subscription-events";

const PREMIUM_PRICE = "price_premium_test";
const PRO_PRICE = "price_pro_test";
// Unix seconds; noon UTC so the formatted date is the same in every time zone
const PERIOD_END = Date.UTC(2026, 11, 17, 12) / 1000;

beforeEach(() => {
  vi.stubEnv("STRIPE_PREMIUM_PRICE_ID", PREMIUM_PRICE);
  vi.stubEnv("STRIPE_PRO_PRICE_ID", PRO_PRICE);
});

const subscription = (overrides: Record<string, unknown> = {}, priceId = PREMIUM_PRICE) => ({
  id: "sub_123",
  object: "subscription",
  status: "active",
  cancel_at: null,
  cancel_at_period_end: false,
  trial_end: null,
  items: {
    data: [
      {
        current_period_end: PERIOD_END,
        price: { id: priceId, recurring: { interval: "month" } },
      },
    ],
  },
  ...overrides,
});

const event = (
  type: string,
  object: Record<string, unknown>,
  previousAttributes?: Record<string, unknown>,
): Stripe.Event =>
  ({
    id: "evt_123",
    type,
    data: { object, ...(previousAttributes && { previous_attributes: previousAttributes }) },
  }) as unknown as Stripe.Event;

describe("getSubscriptionNotification", () => {
  it("a new subscription becomes plan_activated, once per subscription", () => {
    const notification = getSubscriptionNotification(
      event("customer.subscription.created", subscription()),
    );
    expect(notification).toMatchObject({
      type: "plan_activated",
      title: "Premium is active",
      dedupeKey: "plan_activated:sub_123",
      link: "/profile",
    });
  });

  it("a new subscription in a trial becomes trial_started", () => {
    const notification = getSubscriptionNotification(
      event(
        "customer.subscription.created",
        subscription({ status: "trialing", trial_end: PERIOD_END }),
      ),
    );
    expect(notification).toMatchObject({ type: "trial_started" });
    expect(notification?.body).toContain("December 17, 2026");
  });

  it("a scheduled cancellation becomes subscription_canceled", () => {
    const notification = getSubscriptionNotification(
      event(
        "customer.subscription.updated",
        subscription({ cancel_at_period_end: true, cancel_at: PERIOD_END }),
        { cancel_at_period_end: false, cancel_at: null },
      ),
    );
    expect(notification).toMatchObject({
      type: "subscription_canceled",
      dedupeKey: "stripe:evt_123",
    });
    expect(notification?.body).toContain("You keep Premium until December 17, 2026");
  });

  it("a portal cancellation via cancel_at becomes subscription_canceled", () => {
    const notification = getSubscriptionNotification(
      event("customer.subscription.updated", subscription({ cancel_at: PERIOD_END }), {
        cancel_at: null,
      }),
    );
    expect(notification?.type).toBe("subscription_canceled");
  });

  it("clearing the cancellation becomes subscription_resumed", () => {
    expect(
      getSubscriptionNotification(
        event("customer.subscription.updated", subscription(), {
          cancel_at_period_end: true,
          cancel_at: PERIOD_END,
        }),
      )?.type,
    ).toBe("subscription_resumed");
    expect(
      getSubscriptionNotification(
        event("customer.subscription.updated", subscription(), { cancel_at: PERIOD_END }),
      )?.type,
    ).toBe("subscription_resumed");
  });

  it("a price change becomes plan_changed", () => {
    const notification = getSubscriptionNotification(
      event("customer.subscription.updated", subscription({}, PRO_PRICE), {
        items: { data: [{ price: { id: PREMIUM_PRICE } }] },
      }),
    );
    expect(notification).toMatchObject({ type: "plan_changed", title: "You're now on Pro" });
  });

  it("deleted becomes subscription_ended", () => {
    expect(
      getSubscriptionNotification(
        event("customer.subscription.deleted", subscription({ status: "canceled" })),
      ),
    ).toMatchObject({ type: "subscription_ended", dedupeKey: "stripe:evt_123" });
  });

  it("payment_failed uses the event id as dedupe key", () => {
    expect(
      getSubscriptionNotification(event("invoice.payment_failed", { object: "invoice" })),
    ).toMatchObject({ type: "payment_failed", dedupeKey: "stripe:evt_123", link: "/profile" });
  });

  it("a trial about to end becomes trial_ending", () => {
    const notification = getSubscriptionNotification(
      event(
        "customer.subscription.trial_will_end",
        subscription({ status: "trialing", trial_end: PERIOD_END }),
      ),
    );
    expect(notification?.type).toBe("trial_ending");
    expect(notification?.body).toContain("December 17, 2026");
  });

  it("unrelated updates produce no notification", () => {
    expect(
      getSubscriptionNotification(
        event("customer.subscription.updated", subscription(), { latest_invoice: "in_old" }),
      ),
    ).toBeNull();
    expect(getSubscriptionNotification(event("invoice.paid", { object: "invoice" }))).toBeNull();
  });
});
