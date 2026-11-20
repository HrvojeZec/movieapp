import { beforeEach, describe, expect, it, vi } from "vitest";

const stripe = {
  subscriptions: { update: vi.fn(), retrieve: vi.fn() },
  billingPortal: { sessions: { create: vi.fn() } },
};
const findById = vi.fn();
const syncSubscription = vi.fn();

vi.mock("@/entities/subscription/server/stripe", () => ({ getStripe: () => stripe }));
vi.mock("@/entities/subscription/server/subscriptions", () => ({
  syncSubscription: (id: string) => syncSubscription(id),
}));
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({ default: { findById: (id: string) => findById(id) } }));

const { cancelSubscription, createPortalSession, resumeSubscription } =
  await import("@/features/manage-subscription/server/manage");

const subscriber = (overrides = {}) => ({
  _id: { toString: () => "user-1" },
  email: "e2e@example.com",
  name: "Test",
  favorites: [],
  stripeCustomerId: "cus_123",
  subscriptionId: "sub_123",
  subscriptionStatus: "active",
  subscriptionPlan: "premium",
  cancelAt: null,
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("APP_URL", "https://movies.example.com");
  stripe.subscriptions.update.mockReset().mockResolvedValue({});
  stripe.subscriptions.retrieve.mockReset();
  stripe.billingPortal.sessions.create
    .mockReset()
    .mockResolvedValue({ url: "https://billing.stripe.com/session/abc" });
  findById.mockReset();
  syncSubscription.mockReset().mockImplementation(async () => subscriber());
});

describe("cancelSubscription", () => {
  it("cancel schedules the end of the period", async () => {
    findById.mockResolvedValue(subscriber());

    await cancelSubscription("user-1");

    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
      cancel_at_period_end: true,
    });
    expect(syncSubscription).toHaveBeenCalledWith("sub_123");
  });

  it("cancel without a subscription is a conflict", async () => {
    findById.mockResolvedValue(
      subscriber({ subscriptionId: undefined, subscriptionStatus: "free" }),
    );

    await expect(cancelSubscription("user-1")).rejects.toMatchObject({ status: 409 });
    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
  });

  it("canceling twice is a conflict", async () => {
    findById.mockResolvedValue(subscriber({ cancelAt: new Date("2027-01-01") }));

    await expect(cancelSubscription("user-1")).rejects.toMatchObject({ status: 409 });
  });
});

describe("resumeSubscription", () => {
  // Stripe rejects a request that sends both, so resume clears whichever one is set
  it("resume clears the flag our own cancel set", async () => {
    findById.mockResolvedValue(subscriber({ cancelAt: new Date("2027-01-01") }));
    stripe.subscriptions.retrieve.mockResolvedValue({
      cancel_at_period_end: true,
      cancel_at: 1_798_761_600,
    });

    await resumeSubscription("user-1");

    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
      cancel_at_period_end: false,
    });
  });

  it("resume clears a cancellation the portal scheduled", async () => {
    findById.mockResolvedValue(subscriber({ cancelAt: new Date("2027-01-01") }));
    stripe.subscriptions.retrieve.mockResolvedValue({
      cancel_at_period_end: false,
      cancel_at: 1_798_761_600,
    });

    await resumeSubscription("user-1");

    expect(stripe.subscriptions.update).toHaveBeenCalledWith("sub_123", { cancel_at: "" });
  });

  it("resuming a renewing subscription is a conflict", async () => {
    findById.mockResolvedValue(subscriber());

    await expect(resumeSubscription("user-1")).rejects.toMatchObject({ status: 409 });
  });
});

describe("createPortalSession", () => {
  it("the portal returns to the profile page", async () => {
    findById.mockResolvedValue(subscriber());

    await expect(createPortalSession("user-1")).resolves.toBe(
      "https://billing.stripe.com/session/abc",
    );
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://movies.example.com/profile",
    });
  });

  it("a user who never paid has no billing to manage", async () => {
    findById.mockResolvedValue(subscriber({ stripeCustomerId: undefined }));

    await expect(createPortalSession("user-1")).rejects.toMatchObject({ status: 409 });
  });

  it("a missing user is a 404", async () => {
    findById.mockResolvedValue(null);

    await expect(createPortalSession("user-1")).rejects.toMatchObject({ status: 404 });
  });
});
