import { MemoryRateLimiter } from "./memory-limiter";
import { RATE_LIMITS, type RateLimitName } from "./rate-limits";
import type { RateLimiter } from "./types";
import { UpstashRateLimiter, type UpstashConfig } from "./upstash-limiter";

const limiters = new Map<RateLimitName, RateLimiter>();
let warnedAboutMemory = false;

// Upstash's own names, or the ones the Vercel Marketplace integration sets. An empty value counts as
// unset, so a blank line in an env file doesn't hide the other name.
function getUpstashConfig(): UpstashConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/** Upstash when configured, otherwise in-memory (fine locally and in tests, weak on serverless). */
export function getRateLimiter(name: RateLimitName): RateLimiter {
  const existing = limiters.get(name);
  if (existing) return existing;

  const config = getUpstashConfig();
  if (!config && process.env.NODE_ENV === "production" && !warnedAboutMemory) {
    warnedAboutMemory = true;
    console.warn(
      "Upstash Redis is not configured: rate limits are counted in memory, per server instance.",
    );
  }

  const rule = RATE_LIMITS[name];
  const limiter = config ? new UpstashRateLimiter(name, rule, config) : new MemoryRateLimiter(rule);
  limiters.set(name, limiter);
  return limiter;
}
