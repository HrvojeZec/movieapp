import type { Metadata } from "next";
import { FavoritesView } from "@/features/favorites/views/FavoritesView";

export const metadata: Metadata = { title: "My Favorites" };

export default function Page() {
  return <FavoritesView />;
}
