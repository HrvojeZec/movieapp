import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Each test gets fresh limiter state (it lives in module scope)
async function loadEnforce() {
  vi.resetModules();
  return import("@/server/rate-limit/enforce");
}

describe("enforceRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T12:00:00Z"));
    // No Upstash configuration: the in-memory limiter is used
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("KV_REST_API_URL", "");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.doUnmock("@/server/rate-limit/limiters");
  });

  it("lets requests through up to the limit", async () => {
    const { enforceRateLimit } = await loadEnforce();
    for (let i = 0; i < 5; i++) {
      await expect(enforceRateLimit("login", "1.2.3.4:ana@example.com")).resolves.toBeUndefined();
    }
  });

  it("answers the next one with a 429, a readable wait and Retry-After", async () => {
    const { enforceRateLimit } = await loadEnforce();
    for (let i = 0; i < 5; i++) await enforceRateLimit("login", "key");

    const error = await enforceRateLimit("login", "key").catch((e: unknown) => e);

    // Matched by name: resetModules loads a fresh copy of the RouteError class
    expect(error).toMatchObject({
      name: "RouteError",
      status: 429,
      message: "Too many login attempts. Try again in 15 minutes.",
      headers: { "Retry-After": "900" },
    });
  });

  it("lets the request through when the limiter itself fails", async () => {
    vi.doMock("@/server/rate-limit/limiters", () => ({
      getRateLimiter: () => ({ limit: () => Promise.reject(new Error("Redis is down")) }),
    }));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { enforceRateLimit } = await loadEnforce();

    await expect(enforceRateLimit("tmdb", "1.2.3.4")).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
  });
});
