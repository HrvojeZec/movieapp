import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/Notification", () => ({
  default: { create: (doc: unknown) => create(doc) },
}));

const { notifyUser } = await import("@/features/notifications/server/notify");

const input = {
  type: "payment_failed" as const,
  title: "Payment failed",
  body: "Update your card.",
  link: "/profile",
  dedupeKey: "stripe:evt_123",
};

// What MongoDB throws when a unique index rejects a second document with the same key
const duplicateKeyError = Object.assign(new Error("E11000 duplicate key error"), { code: 11000 });

describe("notifyUser", () => {
  beforeEach(() => {
    create.mockReset();
  });

  it("creates a notification once per dedupe key", async () => {
    create.mockResolvedValue({});

    await expect(notifyUser("507f1f77bcf86cd799439011", input)).resolves.toBe(true);
    expect(create).toHaveBeenCalledWith({ userId: "507f1f77bcf86cd799439011", ...input });
  });

  it("returns false for a duplicate", async () => {
    create.mockImplementation(async () => {
      throw duplicateKeyError;
    });

    await expect(notifyUser("507f1f77bcf86cd799439011", input)).resolves.toBe(false);
  });

  it("passes on other database errors", async () => {
    create.mockImplementation(async () => {
      throw new Error("connection lost");
    });

    await expect(notifyUser("507f1f77bcf86cd799439011", input)).rejects.toThrow("connection lost");
  });
});
