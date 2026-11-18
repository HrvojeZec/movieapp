import type { Metadata } from "next";
import { WatchedView } from "@/features/watched/views/WatchedView";

export const metadata: Metadata = { title: "Watched" };

export default function Page() {
  return <WatchedView />;
}
