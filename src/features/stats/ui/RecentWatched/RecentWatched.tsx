"use client";
import Link from "next/link";
import { Image, Skeleton, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { motion } from "motion/react";
import { useMoviesByIds } from "@/features/movies/hooks/useMoviesByIds";
import { getImageUrl } from "@/features/movies/lib/images";
import { ROUTES } from "@/shared/routes";
import { SPRINGS, STAGGER_STEP } from "@/shared/ui/motion/motion.constants";
import classes from "./RecentWatched.module.scss";

const POSTER_RATIO = 2 / 3;
const POSTER_GAP = 12;
const ENTER_OFFSET = 12;

/** The latest watched movies as posters, as many as fit the widget's width; each opens its movie. */
export function RecentWatched({ ids }: { ids: string[] }) {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const { movies, isPending } = useMoviesByIds(ids.map(Number));

  if (ids.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        Movies you mark as watched show up here.
      </Text>
    );
  }

  const posterWidth = height * POSTER_RATIO;
  const fits = posterWidth > 0 ? Math.floor((width + POSTER_GAP) / (posterWidth + POSTER_GAP)) : 0;
  const byId = new Map(movies.map((movie) => [String(movie.id), movie]));
  // Newest first, in the order the stats list them
  const shown = ids.slice(0, Math.max(1, fits));

  return (
    <div ref={ref} className={classes.row}>
      {height > 0 &&
        shown.map((id, index) => {
          const movie = byId.get(id);
          if (!movie) {
            return isPending ? (
              <Skeleton key={id} className={classes.poster} style={{ width: posterWidth }} />
            ) : null;
          }
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: ENTER_OFFSET }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRINGS.gentle, delay: index * STAGGER_STEP }}
              style={{ width: posterWidth }}
            >
              <Link href={ROUTES.movie(movie.id)} className={classes.link} title={movie.title}>
                <Image
                  src={getImageUrl(movie.poster_path, "w300")}
                  alt={movie.title}
                  className={classes.poster}
                  loading="lazy"
                />
              </Link>
            </motion.div>
          );
        })}
    </div>
  );
}
