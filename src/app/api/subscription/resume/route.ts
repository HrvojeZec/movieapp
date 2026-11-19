import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { resumeSubscription } from "@/features/subscription/server/manage";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

// POST /api/subscription/resume: undoes a scheduled cancellation. Returns the updated user so
// the profile shows the change at once.
export const POST = withRouteHandler("Resume subscription", async (request) => {
  const { userId } = requireSession(request);
  await enforceRateLimit("subscription", userId);

  const user = await resumeSubscription(userId);
  return NextResponse.json({ user });
});
