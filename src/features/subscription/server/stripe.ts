import Stripe from "stripe";

// Must match the API version of the webhook endpoint in the Stripe Dashboard, otherwise
// event payloads won't have the shape the SDK types describe.
export const STRIPE_API_VERSION = "2026-10-28.endive";

let client: Stripe | null = null;

// Created lazily so importing this module (e.g. during `next build`) doesn't require the secret.
export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    client = new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
  }
  return client;
}
