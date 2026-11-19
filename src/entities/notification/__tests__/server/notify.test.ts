import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const findUser = vi.fn();
const sendEmail = vi.fn();
vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/Notification", () => ({
  default: { create: (doc: unknown) => create(doc) },
}));
vi.mock("@/server/models/User", () => ({
  default: { findById: (id: string) => ({ select: () => findUser(id) }) },
}));
vi.mock("@/server/email/send", () => ({ sendEmail: (message: unknown) => sendEmail(message) }));

const { notifyUser } = await import("@/entities/notification/server/notify");

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
    findUser.mockReset().mockResolvedValue({ name: "Ana", email: "ana@example.com" });
    sendEmail.mockReset().mockResolvedValue(true);
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

  it("doesn't email unless asked to", async () => {
    create.mockResolvedValue({});

    await notifyUser("507f1f77bcf86cd799439011", input);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("emails only for new notifications", async () => {
    create.mockResolvedValue({});
    await notifyUser("507f1f77bcf86cd799439011", input, { email: true });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ana@example.com", subject: "Payment failed" }),
    );

    sendEmail.mockClear();
    create.mockImplementation(async () => {
      throw duplicateKeyError;
    });
    await notifyUser("507f1f77bcf86cd799439011", input, { email: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("keeps the notification when the email can't be prepared", async () => {
    create.mockResolvedValue({});
    findUser.mockImplementation(async () => {
      throw new Error("connection lost");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(notifyUser("507f1f77bcf86cd799439011", input, { email: true })).resolves.toBe(
      true,
    );
  });
});
