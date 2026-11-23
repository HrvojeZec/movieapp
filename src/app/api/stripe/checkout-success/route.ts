import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { confirmCheckoutSession } from "@/features/checkout/server/checkout";
import { checkoutSuccessSchema } from "@/features/checkout/validations/checkout.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

export const POST = withRouteHandler("Checkout success", async (request) => {
  const { userId } = await requireSession(request);
  await enforceRateLimit("checkout", userId);
  const { sessionId } = await parseJson(
    request,
    checkoutSuccessSchema,
    "Invalid checkout session ID",
  );

  const user = await confirmCheckoutSession(userId, sessionId);
  return NextResponse.json({ success: true, user });
});
