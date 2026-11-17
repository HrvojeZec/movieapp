import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRateLimiter } from "@/server/rate-limit/memory-limiter";
import { UpstashRateLimiter } from "@/server/rate-limit/upstash-limiter";

async function loadLimiters() {
  vi.resetModules();
  const [{ getRateLimiter }, memory, upstash] = await Promise.all([
    import("@/server/rate-limit/limiters"),
    import("@/server/rate-limit/memory-limiter"),
    import("@/server/rate-limit/upstash-limiter"),
  ]);
  return {
    getRateLimiter,
    Memory: memory.MemoryRateLimiter as typeof MemoryRateLimiter,
    Upstash: upstash.UpstashRateLimiter as typeof UpstashRateLimiter,
  };
}

describe("getRateLimiter", () => {
  beforeEach(() => {
    for (const name of [
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
      "KV_REST_API_URL",
      "KV_REST_API_TOKEN",
    ]) {
      vi.stubEnv(name, "");
    }
  });

  it("uses memory when Upstash isn't configured", async () => {
    const { getRateLimiter, Memory } = await loadLimiters();
    expect(getRateLimiter("tmdb")).toBeInstanceOf(Memory);
  });

  it.each([
    ["Upstash", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["Vercel Marketplace", "KV_REST_API_URL", "KV_REST_API_TOKEN"],
  ])("uses Upstash with %s variable names", async (_, urlVar, tokenVar) => {
    vi.stubEnv(urlVar, "https://example.upstash.io");
    vi.stubEnv(tokenVar, "token");
    const { getRateLimiter, Upstash } = await loadLimiters();
    expect(getRateLimiter("tmdb")).toBeInstanceOf(Upstash);
  });

  it("reuses one limiter per name, so counts aren't lost between requests", async () => {
    const { getRateLimiter } = await loadLimiters();
    expect(getRateLimiter("login")).toBe(getRateLimiter("login"));
    expect(getRateLimiter("login")).not.toBe(getRateLimiter("register"));
  });
});
