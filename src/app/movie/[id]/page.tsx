import type { Metadata } from "next";
import { MovieDetailsView } from "@/features/movies/views/MovieDetailsView";

export const metadata: Metadata = { title: "Movie details" };

export default function Page() {
  return <MovieDetailsView />;
}
