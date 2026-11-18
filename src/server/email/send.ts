import { getRateLimiter } from "@/server/rate-limit/limiters";
import { getEmailSender } from "./sender";
import type { EmailMessage } from "./types";

// One shared budget for the whole app: Gmail's daily limit counts every email from the account
const EMAIL_QUOTA_KEY = "all";

/** Within the daily email budget? If the counter itself fails, send anyway: Gmail still caps. */
async function withinDailyLimit(): Promise<boolean> {
  try {
    return (await getRateLimiter("email").limit(EMAIL_QUOTA_KEY)).success;
  } catch (error) {
    console.error("Email quota check failed; sending anyway:", error);
    return true;
  }
}

/**
 * Sends an email and reports whether it went out. Never throws: an email is never worth failing
 * the request (or the Stripe webhook) that triggered it.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const sender = getEmailSender();
  // Only real sends count: captured test emails and skipped ones would otherwise use up the
  // shared daily budget (the counter lives in Upstash, which local runs and tests share)
  if (sender.countsTowardDailyLimit && !(await withinDailyLimit())) {
    console.warn(`Daily email limit reached; not sending "${message.subject}"`);
    return false;
  }
  try {
    await sender.send(message);
    return true;
  } catch (error) {
    console.error(`Sending "${message.subject}" failed:`, error);
    return false;
  }
}
