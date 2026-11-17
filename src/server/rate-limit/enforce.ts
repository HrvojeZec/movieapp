import { RouteError } from "@/server/http/route-error";
import { formatWait } from "@/shared/lib/format";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { SECOND_MS } from "@/shared/lib/time";
import { getRateLimiter } from "./limiters";
import { RATE_LIMITS, type RateLimitName } from "./rate-limits";

/**
 * Counts one request for `key` and throws a 429 with Retry-After when the limit is reached.
 * If the limiter itself fails (e.g. Redis is down), the request goes through: an outage of the
 * rate limiter shouldn't lock every user out.
 */
export async function enforceRateLimit(name: RateLimitName, key: string): Promise<void> {
  let result;
  try {
    result = await getRateLimiter(name).limit(key);
  } catch (error) {
    console.error(`Rate limiter "${name}" failed; letting the request through:`, error);
    return;
  }

  if (result.success) return;

  const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / SECOND_MS));
  throw new RouteError(
    HTTP_STATUS.TOO_MANY_REQUESTS,
    `${RATE_LIMITS[name].message} Try again in ${formatWait(retryAfterSeconds)}.`,
    undefined,
    { "Retry-After": String(retryAfterSeconds) },
  );
}
