import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { createSubscriptionCheckout } from "@/features/checkout/server/checkout";
import { checkoutSessionSchema } from "@/features/checkout/validations/checkout.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

export const POST = withRouteHandler("Create checkout session", async (request) => {
  const { userId } = await requireSession(request);
  await enforceRateLimit("checkout", userId);
  const { plan, interval } = await parseJson(request, checkoutSessionSchema, "Invalid plan");

  const url = await createSubscriptionCheckout(userId, plan, interval, request.nextUrl.origin);
  return NextResponse.json({ url });
});
