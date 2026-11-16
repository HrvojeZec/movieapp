import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/serverAuth";
import connectDB from "@/lib/db/mongodb";
import { getStripe } from "@/lib/payments/stripe";
import { getPriceIdForPlan, hasActiveSubscription } from "@/lib/payments/plans";
import { checkoutSessionSchema } from "@/lib/validation/validation";
import User from "@/models/Users";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = checkoutSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid plan" }, { status: 400 });
  }

  // The price is resolved on the server so clients can't choose an arbitrary price ID.
  const priceId = getPriceIdForPlan(parsed.data.plan);
  if (!priceId) {
    return NextResponse.json({ message: "Payments are not configured" }, { status: 503 });
  }

  try {
    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (hasActiveSubscription(user.subscriptionStatus)) {
      return NextResponse.json(
        { message: "You already have an active subscription" },
        { status: 409 },
      );
    }

    const stripe = getStripe();

    // Creating the customer up front lets webhooks map events to the user by customer ID,
    // instead of relying on the email entered in Checkout.
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const origin = request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user._id.toString(),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription/pricing`,
      integration_identifier: "movieapp_subscription_qvhrtmke",
    });

    if (!session.url) {
      throw new Error(`Checkout session ${session.id} has no URL`);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
