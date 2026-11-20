import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimiter, RateLimitResult, RateLimitRule } from "./types";

// Keys in Redis look like "movieapp:ratelimit:login:<ip>:<email>"
const KEY_PREFIX = "movieapp:ratelimit";

export interface UpstashConfig {
  url: string;
  token: string;
}

/** Sliding window in Upstash Redis, shared by every serverless instance. */
export class UpstashRateLimiter implements RateLimiter {
  private readonly ratelimit: Ratelimit;

  constructor(name: string, rule: RateLimitRule, config: UpstashConfig) {
    this.ratelimit = new Ratelimit({
      redis: new Redis({ url: config.url, token: config.token }),
      limiter: Ratelimit.slidingWindow(rule.requests, `${rule.windowMs} ms`),
      prefix: `${KEY_PREFIX}:${name}`,
    });
  }

  async limit(key: string): Promise<RateLimitResult> {
    const { success, limit, remaining, reset } = await this.ratelimit.limit(key);
    return { success, limit, remaining, reset };
  }
}
