import type { Metadata } from "next";
import { WatchedView } from "@/views/watched/WatchedView";

export const metadata: Metadata = { title: "Watched" };

export default function Page() {
  return <WatchedView />;
}
