import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { verifyToken, updateUserStripeInfo } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { message: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const customerId = session.customer as string;

    let planName = "premium";
    const priceId = subscription.items.data[0]?.price.id;

    if (priceId === "price_1RvMFDC5af6NCCUEsIQfGj0d") {
      planName = "pro";
    } else if (priceId === "price_1RvMEmC5af6NCCUEtaqTrv4u") {
      planName = "premium";
    }

    const updatedUser = await updateUserStripeInfo(
      decoded.userId,
      customerId,
      subscription.status,
      planName
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Checkout success error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
