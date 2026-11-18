import type { Metadata } from "next";
import { WatchlistView } from "@/features/watchlist/views/WatchlistView";

export const metadata: Metadata = { title: "My Watchlist" };

export default function Page() {
  return <WatchlistView />;
}
