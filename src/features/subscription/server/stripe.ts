import Stripe from "stripe";
import { requireEnv } from "@/server/env";

// Must match the API version of the webhook endpoint in the Stripe Dashboard, otherwise
// event payloads won't have the shape the SDK types describe.
const STRIPE_API_VERSION = "2026-10-28.endive";

let client: Stripe | null = null;

// Created lazily so importing this module (e.g. during `next build`) doesn't require the secret.
export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(requireEnv("STRIPE_SECRET_KEY"), { apiVersion: STRIPE_API_VERSION });
  }
  return client;
}
