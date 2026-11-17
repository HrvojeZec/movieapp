import { describe, expect, it } from "vitest";
import { MemoryRateLimiter } from "@/server/rate-limit/memory-limiter";

const WINDOW_MS = 60_000;

/** A limiter on a clock the test moves by hand. */
function setup(requests = 3) {
  let now = 1_000_000;
  const limiter = new MemoryRateLimiter({ requests, windowMs: WINDOW_MS }, () => now);
  return { limiter, advance: (ms: number) => (now += ms), now: () => now };
}

describe("MemoryRateLimiter", () => {
  it("allows requests up to the limit and counts down what's left", async () => {
    const { limiter } = setup(3);
    const remaining = [];
    for (let i = 0; i < 3; i++) remaining.push((await limiter.limit("ip")).remaining);
    expect(remaining).toEqual([2, 1, 0]);
  });

  it("blocks the request over the limit and says when the window frees up", async () => {
    const { limiter, now } = setup(2);
    const start = now();
    await limiter.limit("ip");
    await limiter.limit("ip");

    const blocked = await limiter.limit("ip");
    expect(blocked).toMatchObject({ success: false, remaining: 0, reset: start + WINDOW_MS });
  });

  it("slides: a request is allowed again once the oldest one leaves the window", async () => {
    const { limiter, advance } = setup(2);
    await limiter.limit("ip");
    advance(WINDOW_MS / 2);
    await limiter.limit("ip");
    expect((await limiter.limit("ip")).success).toBe(false);

    advance(WINDOW_MS / 2 + 1);
    expect((await limiter.limit("ip")).success).toBe(true);
  });

  it("counts every key separately", async () => {
    const { limiter } = setup(1);
    expect((await limiter.limit("a")).success).toBe(true);
    expect((await limiter.limit("b")).success).toBe(true);
    expect((await limiter.limit("a")).success).toBe(false);
  });

  it("doesn't count blocked requests, so waiting is enough to get through", async () => {
    const { limiter, advance } = setup(1);
    await limiter.limit("ip");
    for (let i = 0; i < 5; i++) await limiter.limit("ip");

    advance(WINDOW_MS + 1);
    expect((await limiter.limit("ip")).success).toBe(true);
  });
});
