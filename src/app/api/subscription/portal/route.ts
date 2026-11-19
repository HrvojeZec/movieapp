import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { createPortalSession } from "@/features/subscription/server/manage";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

// POST /api/subscription/portal: a Stripe Customer Portal URL for the card, invoices and plan
export const POST = withRouteHandler("Billing portal", async (request) => {
  const { userId } = requireSession(request);
  await enforceRateLimit("subscription", userId);

  const url = await createPortalSession(userId);
  return NextResponse.json({ url });
});
