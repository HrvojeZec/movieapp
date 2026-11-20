import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const limit = vi.fn();
// Gmail counts toward the daily limit; the E2E capture and the local log don't
let countsTowardDailyLimit = true;
vi.mock("@/server/email/sender", () => ({
  getEmailSender: () => ({ send, countsTowardDailyLimit }),
}));
vi.mock("@/server/rate-limit/limiters", () => ({ getRateLimiter: () => ({ limit }) }));

const { sendEmail } = await import("@/server/email/send");

const message = {
  to: "e2e@example.com",
  subject: "Welcome",
  html: "<p>Hi</p>",
  text: "Hi",
};
const allowed = { success: true, limit: 400, remaining: 399, reset: 0 };

describe("sendEmail", () => {
  beforeEach(() => {
    countsTowardDailyLimit = true;
    send.mockReset().mockResolvedValue(undefined);
    limit.mockReset().mockResolvedValue(allowed);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("sends the message and reports success", async () => {
    await expect(sendEmail(message)).resolves.toBe(true);
    expect(send).toHaveBeenCalledWith(message);
  });

  it("does not send above the daily limit", async () => {
    limit.mockResolvedValue({ ...allowed, success: false, remaining: 0 });

    await expect(sendEmail(message)).resolves.toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("never throws when the sender fails", async () => {
    send.mockImplementation(async () => {
      throw new Error("SMTP down");
    });

    await expect(sendEmail(message)).resolves.toBe(false);
  });

  it("still sends when the limit can't be checked", async () => {
    limit.mockImplementation(async () => {
      throw new Error("Redis down");
    });

    await expect(sendEmail(message)).resolves.toBe(true);
  });

  it("doesn't count emails that aren't really sent", async () => {
    countsTowardDailyLimit = false;
    limit.mockResolvedValue({ ...allowed, success: false, remaining: 0 });

    await expect(sendEmail(message)).resolves.toBe(true);
    expect(limit).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith(message);
  });
});
