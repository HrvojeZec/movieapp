import type { Metadata } from "next";
import { AboutView } from "@/views/about/AboutView";

export const metadata: Metadata = {
  title: "About & credits",
  description:
    "What MovieHub is, where its movie data comes from and the software it is built with.",
};

export default function Page() {
  return <AboutView />;
}
