import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findOne = vi.fn();
const updateOne = vi.fn();
const findOneAndUpdate = vi.fn();
const sendEmail = vi.fn();
const notifyUser = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({
  default: {
    findOne: (filter: unknown) => findOne(filter),
    updateOne: (filter: unknown, update: unknown) => updateOne(filter, update),
    findOneAndUpdate: (filter: unknown, update: unknown, options: unknown) =>
      findOneAndUpdate(filter, update, options),
  },
}));
vi.mock("@/server/email/send", () => ({ sendEmail: (message: unknown) => sendEmail(message) }));
vi.mock("@/features/notifications/server/notify", () => ({
  notifyUser: (...args: unknown[]) => notifyUser(...args),
}));

const { notifyPasswordChanged, requestPasswordReset, resetPassword } =
  await import("@/features/auth/server/password-reset");

const NOW = new Date("2026-11-18T12:00:00Z");
const HOUR_MS = 60 * 60 * 1000;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const user = { _id: { toString: () => "user-1" }, name: "Ana", email: "ana@example.com" };

/** The token from the link in the last reset email. */
const tokenFromEmail = () => {
  const { text } = sendEmail.mock.calls.at(-1)![0] as { text: string };
  return new URL(text.match(/https?:\/\/\S+reset-password\S+/)![0]).searchParams.get("token")!;
};

describe("requestPasswordReset", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    vi.stubEnv("APP_URL", "https://movies.example.com");
    findOne.mockReset().mockResolvedValue(user);
    updateOne.mockReset().mockResolvedValue({});
    sendEmail.mockReset().mockResolvedValue(true);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores only a hash of the token", async () => {
    await requestPasswordReset("ana@example.com");

    const token = tokenFromEmail();
    expect(token).toMatch(/^[a-f\d]{64}$/);
    const [, update] = updateOne.mock.calls[0];
    expect(update.passwordResetTokenHash).toBe(sha256(token));
    expect(JSON.stringify(update)).not.toContain(token);
  });

  it("the token expires after an hour", async () => {
    await requestPasswordReset("ana@example.com");

    const [, update] = updateOne.mock.calls[0];
    expect(update.passwordResetExpires).toEqual(new Date(NOW.getTime() + HOUR_MS));
  });

  it("emails the link to the account's address", async () => {
    await requestPasswordReset("ana@example.com");

    const message = sendEmail.mock.calls[0][0];
    expect(message.to).toBe("ana@example.com");
    expect(message.text).toContain("https://movies.example.com/auth/reset-password?token=");
  });

  it("an unknown email gets the same answer", async () => {
    findOne.mockResolvedValue(null);

    await expect(requestPasswordReset("nobody@example.com")).resolves.toBeUndefined();
    expect(updateOne).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("email failure still answers 200", async () => {
    sendEmail.mockResolvedValue(false);

    await expect(requestPasswordReset("ana@example.com")).resolves.toBeUndefined();
  });
});

describe("resetPassword", () => {
  const save = vi.fn();
  const TOKEN = "a".repeat(64);

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    save.mockReset().mockResolvedValue(undefined);
    notifyUser.mockReset().mockResolvedValue(true);
    findOneAndUpdate.mockReset().mockResolvedValue({ ...user, save });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("a token works once", async () => {
    const changed = { ...user, save, password: "old-hash" };
    findOneAndUpdate.mockResolvedValue(changed);

    await expect(resetPassword(TOKEN, "NewPass123")).resolves.toBe("user-1");

    // The token is claimed and cleared in one update, so a second use finds nothing
    const [filter, update] = findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({
      passwordResetTokenHash: sha256(TOKEN),
      passwordResetExpires: { $gt: NOW },
    });
    expect(update).toEqual({ $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 } });
    expect(changed.password).toBe("NewPass123");
    expect(save).toHaveBeenCalled();
  });

  it("rejects an invalid, used or expired token", async () => {
    findOneAndUpdate.mockResolvedValue(null);

    await expect(resetPassword(TOKEN, "NewPass123")).rejects.toMatchObject({
      status: 400,
      message: "This reset link is invalid or has expired",
    });
  });

  it("tells the user their password changed, by notification and email", async () => {
    await notifyPasswordChanged("user-1");

    expect(notifyUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ type: "password_changed" }),
      { email: true },
    );
  });

  it("never throws when the confirmation can't be stored", async () => {
    notifyUser.mockImplementation(async () => {
      throw new Error("connection lost");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(notifyPasswordChanged("user-1")).resolves.toBeUndefined();
  });
});
