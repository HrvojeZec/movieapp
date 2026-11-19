import { beforeEach, describe, expect, it, vi } from "vitest";

const stripe = { subscriptions: { retrieve: vi.fn(), list: vi.fn() } };
const findOneAndUpdate = vi.fn();

vi.mock("@/features/subscription/server/stripe", () => ({ getStripe: () => stripe }));
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({
  default: { findOneAndUpdate: (...args: unknown[]) => findOneAndUpdate(...args) },
}));

const { syncSubscription } = await import("@/features/subscription/server/subscriptions");

const sub = (id: string, status: string, created: number) => ({
  id,
  status,
  created,
  customer: "cus_1",
  cancel_at: null,
  cancel_at_period_end: false,
  trial_start: null,
  trial_end: null,
  items: { data: [{ current_period_end: 1_800_000_000, price: { id: "price_x" } }] },
});

const written = () => findOneAndUpdate.mock.calls[0][1];

describe("syncSubscription", () => {
  beforeEach(() => {
    stripe.subscriptions.retrieve.mockReset();
    stripe.subscriptions.list.mockReset();
    findOneAndUpdate.mockReset().mockResolvedValue({ _id: "user-1" });
  });

  it("a late event of an ended subscription keeps the newer active one", async () => {
    const ended = sub("sub_old", "canceled", 100);
    const current = sub("sub_new", "active", 200);
    stripe.subscriptions.retrieve.mockResolvedValue(ended);
    stripe.subscriptions.list.mockResolvedValue({ data: [current, ended] });

    await syncSubscription("sub_old");

    expect(stripe.subscriptions.list).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_1", status: "all" }),
    );
    expect(findOneAndUpdate.mock.calls[0][0]).toEqual({ stripeCustomerId: "cus_1" });
    expect(written()).toMatchObject({ subscriptionId: "sub_new", subscriptionStatus: "active" });
  });

  it("uses the event's subscription when the list doesn't show it yet", async () => {
    const fresh = sub("sub_fresh", "active", 300);
    stripe.subscriptions.retrieve.mockResolvedValue(fresh);
    stripe.subscriptions.list.mockResolvedValue({ data: [sub("sub_old", "canceled", 100)] });

    await syncSubscription("sub_fresh");

    expect(written()).toMatchObject({ subscriptionId: "sub_fresh" });
  });

  it("a cancellation is stored when nothing else grants access", async () => {
    const ended = sub("sub_1", "canceled", 100);
    stripe.subscriptions.retrieve.mockResolvedValue(ended);
    stripe.subscriptions.list.mockResolvedValue({ data: [ended] });

    await syncSubscription("sub_1");

    expect(written()).toMatchObject({ subscriptionId: "sub_1", subscriptionStatus: "canceled" });
  });
});
