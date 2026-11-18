import { beforeEach, describe, expect, it, vi } from "vitest";
import { isCronRequest } from "@/server/http/cron-auth";

const request = (authorization?: string) =>
  new Request("https://movies.example.com/api/cron/subscription-reminders", {
    headers: authorization ? { authorization } : {},
  });

describe("isCronRequest", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret-value-from-vercel");
  });

  it("accepts the bearer token Vercel Cron sends", () => {
    expect(isCronRequest(request("Bearer s3cret-value-from-vercel"))).toBe(true);
  });

  it.each([undefined, "Bearer wrong", "s3cret-value-from-vercel", "Bearer "])(
    "rejects %j",
    (authorization) => {
      expect(isCronRequest(request(authorization))).toBe(false);
    },
  );

  it("rejects everything when no secret is configured", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(isCronRequest(request("Bearer "))).toBe(false);
    expect(isCronRequest(request("Bearer undefined"))).toBe(false);
  });
});
