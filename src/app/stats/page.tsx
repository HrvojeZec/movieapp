import type { Metadata } from "next";
import { StatsView } from "@/views/stats/StatsView";

export const metadata: Metadata = { title: "Your Stats" };

export default function Page() {
  return <StatsView />;
}
