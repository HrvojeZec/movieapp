"use client";
import { MovieCard, type MovieCardProps } from "@/entities/movie/ui/MovieCard/MovieCard";
import { FavoriteButton } from "@/features/toggle-favorite/ui/FavoriteButton/FavoriteButton";
import { WatchedButton } from "@/features/mark-watched/ui/WatchedButton/WatchedButton";
import { WatchlistButton } from "@/features/toggle-watchlist/ui/WatchlistButton/WatchlistButton";

/** The movie card with the user's actions on it. */
export function ActionMovieCard(props: Omit<MovieCardProps, "actions">) {
  const movieId = props.movie.id;
  return (
    <MovieCard
      {...props}
      // The heart for everyone, the eye once logged in, the bookmark only on plans with a watchlist
      actions={
        <>
          <FavoriteButton movieId={movieId} />
          <WatchedButton movieId={movieId} />
          <WatchlistButton movieId={movieId} />
        </>
      }
    />
  );
}
