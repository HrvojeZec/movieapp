import { timingSafeEqual } from "node:crypto";

/**
 * True for a request from Vercel Cron, which sends `Authorization: Bearer <CRON_SECRET>`.
 * Without a configured secret nothing is accepted, so the job can't be triggered by anyone.
 */
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  // Constant-time comparison, so response timing doesn't reveal how much of the secret matched
  return received.length === expected.length && timingSafeEqual(received, expected);
}
