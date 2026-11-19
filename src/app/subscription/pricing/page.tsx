import type { Metadata } from "next";
import { PricingView } from "@/views/pricing/PricingView";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return <PricingView />;
}
