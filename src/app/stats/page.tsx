import type { Metadata } from "next";
import { StatsView } from "@/features/stats/views/StatsView";

export const metadata: Metadata = { title: "Your Stats" };

export default function Page() {
  return <StatsView />;
}
