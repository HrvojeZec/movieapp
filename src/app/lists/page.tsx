import type { Metadata } from "next";
import { ListsView } from "@/views/lists/ListsView";

export const metadata: Metadata = { title: "My Lists" };

export default function Page() {
  return <ListsView />;
}
