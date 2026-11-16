import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/features/auth/server/users";
import { getSessionUser } from "@/features/auth/server/session";
import { getStripe } from "@/features/subscription/server/stripe";
import {
  getSubscriptionIdFromSession,
  linkStripeCustomer,
  syncSubscription,
} from "@/features/subscription/server/subscriptions";
import { checkoutSuccessSchema } from "@/lib/validation/validation";

/**
 * Called by the success page right after Checkout so the user sees the new plan immediately.
 * The webhook remains the source of truth; this only re-syncs the user's own subscription.
 */
export async function POST(request: NextRequest) {
  const decoded = getSessionUser(request);
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = checkoutSuccessSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid checkout session ID" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(parsed.data.sessionId);

    // Without this check any logged-in user could submit someone else's paid session.
    // Respond with 404 so session IDs of other users can't be probed.
    if (session.client_reference_id !== decoded.userId) {
      return NextResponse.json({ message: "Checkout session not found" }, { status: 404 });
    }

    const subscriptionId = getSubscriptionIdFromSession(session);
    if (session.mode !== "subscription" || !subscriptionId) {
      return NextResponse.json({ message: "Not a subscription checkout" }, { status: 400 });
    }

    if (session.payment_status === "unpaid") {
      return NextResponse.json({ message: "Payment is still processing" }, { status: 409 });
    }

    if (typeof session.customer === "string") {
      await linkStripeCustomer(decoded.userId, session.customer);
    }
    await syncSubscription(subscriptionId);

    const user = await findUserById(decoded.userId);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Checkout success error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
