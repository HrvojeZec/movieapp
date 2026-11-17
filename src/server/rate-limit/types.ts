export interface RateLimitRule {
  /** Requests allowed per window. */
  requests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** When the oldest counted request leaves the window (epoch milliseconds). */
  reset: number;
}

/** Counts requests per key; implemented by Upstash Redis and by an in-memory fallback. */
export interface RateLimiter {
  limit(key: string): Promise<RateLimitResult>;
}
