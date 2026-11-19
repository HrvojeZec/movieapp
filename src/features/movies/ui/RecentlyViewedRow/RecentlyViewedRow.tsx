"use client";
import { History } from "lucide-react";
import { useRecentlyViewed } from "@/entities/movie/hooks/useRecentlyViewed";
import { HorizontalMovieScroll } from "@/features/movies/ui/HorizontalMovieScroll/HorizontalMovieScroll";

/** Movies opened in this browser, newest first; hidden until there is at least one. */
export function RecentlyViewedRow() {
  const movies = useRecentlyViewed();
  if (movies.length === 0) return null;

  return (
    <HorizontalMovieScroll title="Recently viewed" icon={<History size={18} />} movies={movies} />
  );
}
