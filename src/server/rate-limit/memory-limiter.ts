import type { RateLimiter, RateLimitResult, RateLimitRule } from "./types";

/**
 * Sliding window kept in this process. Correct for one long-running server (local development,
 * Docker, end-to-end tests); on serverless every instance counts separately, so production uses
 * Upstash instead.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly rule: RateLimitRule,
    private readonly now: () => number = Date.now,
  ) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = this.now();
    const windowStart = now - this.rule.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((time) => time > windowStart);

    const success = recent.length < this.rule.requests;
    if (success) recent.push(now);

    // Forget keys with no requests left in the window, so the map doesn't grow forever
    if (recent.length > 0) this.hits.set(key, recent);
    else this.hits.delete(key);

    return {
      success,
      limit: this.rule.requests,
      remaining: Math.max(0, this.rule.requests - recent.length),
      reset: (recent[0] ?? now) + this.rule.windowMs,
    };
  }
}
