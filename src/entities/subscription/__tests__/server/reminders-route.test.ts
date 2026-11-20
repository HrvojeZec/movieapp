import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendSubscriptionReminders = vi.fn();
vi.mock("@/entities/subscription/server/reminders", () => ({
  sendSubscriptionReminders: (now: Date) => sendSubscriptionReminders(now),
}));

const { GET } = await import("@/app/api/cron/subscription-reminders/route");

const call = (authorization?: string) =>
  GET(
    new NextRequest("https://movies.example.com/api/cron/subscription-reminders", {
      headers: authorization ? { authorization } : {},
    }),
    // The route has no URL parameters
    undefined as never,
  );

describe("GET /api/cron/subscription-reminders", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret-value-from-vercel");
    sendSubscriptionReminders.mockReset().mockResolvedValue({ checked: 3, sent: 2 });
  });

  it("rejects a request without the cron secret", async () => {
    const response = await call();
    expect(response.status).toBe(401);
    expect(sendSubscriptionReminders).not.toHaveBeenCalled();
  });

  it("sends the due reminders and reports how many", async () => {
    const response = await call("Bearer s3cret-value-from-vercel");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ checked: 3, sent: 2 });
  });
});
