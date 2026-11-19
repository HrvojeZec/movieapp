import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { cancelSubscription } from "@/features/subscription/server/manage";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

// POST /api/subscription/cancel: cancels at the end of the paid period. Returns the updated
// user so the profile shows the change at once.
export const POST = withRouteHandler("Cancel subscription", async (request) => {
  const { userId } = requireSession(request);
  await enforceRateLimit("subscription", userId);

  const user = await cancelSubscription(userId);
  return NextResponse.json({ user });
});
