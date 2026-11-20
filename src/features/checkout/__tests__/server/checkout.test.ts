import { beforeEach, describe, expect, it, vi } from "vitest";

const stripe = {
  checkout: { sessions: { create: vi.fn(), list: vi.fn(), expire: vi.fn() } },
  customers: { create: vi.fn() },
};
const findById = vi.fn();

vi.mock("@/entities/subscription/server/stripe", () => ({ getStripe: () => stripe }));
vi.mock("@/entities/subscription/server/subscriptions", () => ({}));
vi.mock("@/entities/user/server/users", () => ({}));
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({ default: { findById: (id: string) => findById(id) } }));

const { createSubscriptionCheckout } = await import("@/features/checkout/server/checkout");

const ORIGIN = "https://movies.example.com";
const user = (overrides = {}) => ({
  _id: { toString: () => "user-1" },
  email: "e2e@example.com",
  name: "Test",
  stripeCustomerId: "cus_123",
  subscriptionStatus: "free",
  hasUsedTrial: false,
  ...overrides,
});
const sessionParams = () => stripe.checkout.sessions.create.mock.calls[0][0];

describe("createSubscriptionCheckout", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_PREMIUM_PRICE_ID", "price_premium_month");
    stripe.checkout.sessions.create
      .mockReset()
      .mockResolvedValue({ id: "cs_1", url: "https://checkout.stripe.com/c/cs_1" });
    stripe.checkout.sessions.list.mockReset().mockResolvedValue({ data: [] });
    stripe.checkout.sessions.expire.mockReset().mockResolvedValue({});
    findById.mockReset().mockResolvedValue(user());
  });

  it("the first checkout includes a 14-day trial", async () => {
    await expect(createSubscriptionCheckout("user-1", "premium", "month", ORIGIN)).resolves.toBe(
      "https://checkout.stripe.com/c/cs_1",
    );

    expect(sessionParams()).toMatchObject({
      mode: "subscription",
      line_items: [{ price: "price_premium_month", quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
    });
  });

  it("a returning subscriber gets no trial", async () => {
    findById.mockResolvedValue(user({ subscriptionId: "sub_old", subscriptionStatus: "canceled" }));

    await createSubscriptionCheckout("user-1", "premium", "month", ORIGIN);

    expect(sessionParams()).not.toHaveProperty("subscription_data");
  });

  it("a used trial isn't offered again", async () => {
    findById.mockResolvedValue(user({ hasUsedTrial: true }));

    await createSubscriptionCheckout("user-1", "premium", "month", ORIGIN);

    expect(sessionParams()).not.toHaveProperty("subscription_data");
  });

  it("closes the customer's other open checkouts, so only the newest can be paid", async () => {
    stripe.checkout.sessions.list.mockResolvedValue({
      data: [{ id: "cs_old" }, { id: "cs_older" }],
    });

    await createSubscriptionCheckout("user-1", "premium", "month", ORIGIN);

    expect(stripe.checkout.sessions.list).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_123", status: "open" }),
    );
    expect(stripe.checkout.sessions.expire.mock.calls.map(([id]) => id)).toEqual([
      "cs_old",
      "cs_older",
    ]);
  });

  it("a checkout that can't be closed (paid meanwhile) doesn't block a new one", async () => {
    stripe.checkout.sessions.list.mockResolvedValue({ data: [{ id: "cs_old" }] });
    stripe.checkout.sessions.expire.mockRejectedValue(new Error("already complete"));

    await expect(createSubscriptionCheckout("user-1", "premium", "month", ORIGIN)).resolves.toBe(
      "https://checkout.stripe.com/c/cs_1",
    );
  });

  it("concurrent first checkouts share one Stripe customer", async () => {
    const save = vi.fn();
    findById.mockResolvedValue(user({ stripeCustomerId: undefined, save }));
    stripe.customers.create.mockReset().mockResolvedValue({ id: "cus_new" });

    await createSubscriptionCheckout("user-1", "premium", "month", ORIGIN);

    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "e2e@example.com" }),
      { idempotencyKey: "customer-user-1" },
    );
    expect(sessionParams()).toMatchObject({ customer: "cus_new" });
  });
});
