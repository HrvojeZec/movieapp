import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/Users";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { message: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await handleSubscriptionCreated(subscription, session.customer_email);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId = invoice.subscription;

        if (typeof subscriptionId === "string") {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          await handleSubscriptionUpdated(subscription);
        } else {
          console.log(
            `Received invoice.payment_succeeded for a one-time payment (Invoice ID: ${invoice.id}). No subscription action taken.`
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed for invoice:", invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  customerEmail?: string | null
) {
  try {
    if (!customerEmail) {
      console.error("No customer email in subscription");
      return;
    }

    const user = await User.findOne({ email: customerEmail.toLowerCase() });
    if (!user) {
      console.error("User not found:", customerEmail);
      return;
    }

    const priceId = subscription.items.data[0].price.id;
    let plan = "basic";

    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) plan = "premium";
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";

    await User.findByIdAndUpdate(user._id, {
      stripeCustomerId: subscription.customer as string,
      subscriptionStatus: subscription.status,
      subscriptionPlan: plan,
    });

    console.log("Subscription created for user:", customerEmail, "Plan:", plan);
  } catch (error) {
    console.error("Error handling subscription created:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const user = await User.findOne({
      stripeCustomerId: subscription.customer as string,
    });

    if (!user) {
      console.error("User not found for customer:", subscription.customer);
      return;
    }

    const priceId = subscription.items.data[0].price.id;
    let plan = "basic";

    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) plan = "premium";
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro";

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: subscription.status,
      subscriptionPlan: plan,
    });

    console.log(
      "Subscription updated for user:",
      user.email,
      "Status:",
      subscription.status
    );
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const user = await User.findOne({
      stripeCustomerId: subscription.customer as string,
    });

    if (!user) {
      console.error("User not found for customer:", subscription.customer);
      return;
    }

    await User.findByIdAndUpdate(user._id, {
      subscriptionStatus: "canceled",
      subscriptionPlan: "basic",
    });

    console.log("Subscription canceled for user:", user.email);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}
