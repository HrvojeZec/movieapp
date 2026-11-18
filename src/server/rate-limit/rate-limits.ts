import { DAY_MS, HOUR_MS, MINUTE_MS } from "@/shared/lib/time";
import type { RateLimitRule } from "./types";

interface NamedRule extends RateLimitRule {
  /** First sentence of the 429 message; the wait time is appended. */
  message: string;
}

export const RATE_LIMITS = {
  // Per IP and email: slows down password guessing for one account without locking out a network
  login: {
    requests: 5,
    windowMs: 15 * MINUTE_MS,
    message: "Too many login attempts.",
  },
  // Per IP: stops scripted sign-ups
  register: { requests: 5, windowMs: HOUR_MS, message: "Too many sign-ups from this network." },
  // Per IP: protects the TMDB API quota shared by all users
  tmdb: { requests: 60, windowMs: MINUTE_MS, message: "Too many requests." },
  // Per user: every attempt creates a Stripe Checkout Session
  checkout: { requests: 10, windowMs: MINUTE_MS, message: "Too many checkout attempts." },
  // Per user: cancel, resume and billing portal each call Stripe
  subscription: { requests: 10, windowMs: MINUTE_MS, message: "Too many subscription changes." },
  // One key for the whole app: stays under Gmail's ~500 emails a day with room to spare
  email: { requests: 400, windowMs: DAY_MS, message: "Daily email limit reached." },
} as const satisfies Record<string, NamedRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;
