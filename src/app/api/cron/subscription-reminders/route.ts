import { NextResponse } from "next/server";
import { sendSubscriptionReminders } from "@/features/subscription/server/reminders";
import { isCronRequest } from "@/server/http/cron-auth";
import { RouteError } from "@/server/http/route-error";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

// Runs on every call, never at build time
export const dynamic = "force-dynamic";

// GET /api/cron/subscription-reminders: called once a day by Vercel Cron (vercel.json). Reminds
// subscribers 3 days before a renewal, a scheduled end or the end of a trial; safe to repeat.
export const GET = withRouteHandler("Subscription reminders", async (request) => {
  if (!isCronRequest(request)) {
    throw new RouteError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }
  return NextResponse.json(await sendSubscriptionReminders(new Date()));
});
