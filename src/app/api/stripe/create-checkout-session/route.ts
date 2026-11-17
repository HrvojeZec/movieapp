import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { createSubscriptionCheckout } from "@/features/subscription/server/checkout";
import { checkoutSessionSchema } from "@/features/subscription/validations/subscription.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

export const POST = withRouteHandler("Create checkout session", async (request) => {
  const { userId } = requireSession(request);
  await enforceRateLimit("checkout", userId);
  const { plan } = await parseJson(request, checkoutSessionSchema, "Invalid plan");

  const url = await createSubscriptionCheckout(userId, plan, request.nextUrl.origin);
  return NextResponse.json({ url });
});
