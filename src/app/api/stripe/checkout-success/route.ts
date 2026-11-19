import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { confirmCheckoutSession } from "@/features/checkout/server/checkout";
import { checkoutSuccessSchema } from "@/features/checkout/validations/checkout.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

export const POST = withRouteHandler("Checkout success", async (request) => {
  const { userId } = requireSession(request);
  const { sessionId } = await parseJson(
    request,
    checkoutSuccessSchema,
    "Invalid checkout session ID",
  );

  const user = await confirmCheckoutSession(userId, sessionId);
  return NextResponse.json({ success: true, user });
});
