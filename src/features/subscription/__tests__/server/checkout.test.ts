import { beforeEach, describe, expect, it, vi } from "vitest";

const stripe = {
  checkout: { sessions: { create: vi.fn() } },
  customers: { create: vi.fn() },
};
const findById = vi.fn();

vi.mock("@/features/subscription/server/stripe", () => ({ getStripe: () => stripe }));
vi.mock("@/features/subscription/server/subscriptions", () => ({}));
vi.mock("@/features/auth/server/users", () => ({}));
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({ default: { findById: (id: string) => findById(id) } }));

const { createSubscriptionCheckout } = await import("@/features/subscription/server/checkout");

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
});
