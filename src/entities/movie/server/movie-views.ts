import connectDB from "@/server/db/mongodb";
import UserActivity from "@/server/models/UserActivity";
import { logUserActivity } from "@/server/activity";
import { HOUR_MS } from "@/shared/lib/time";
import { fetchGenreIds } from "./genre-ids";

// A reload or a quick back-and-forth isn't a new visit
const VIEW_DEDUPE_WINDOW_MS = HOUR_MS;

/** Logs that a user opened a movie page, at most once an hour per movie. True if logged. */
export async function recordMovieView(
  userId: string,
  movieId: string,
  now = new Date(),
): Promise<boolean> {
  await connectDB();
  const recent = await UserActivity.exists({
    userId,
    action: "view",
    movieId,
    createdAt: { $gte: new Date(now.getTime() - VIEW_DEDUPE_WINDOW_MS) },
  });
  if (recent) return false;

  // Only views of movies TMDB knows count; their genres aren't kept (nothing reads them, and
  // TMDB's terms limit how long its data may be stored)
  if ((await fetchGenreIds(movieId)) === null) return false;

  await logUserActivity(userId, "view", movieId);
  return true;
}
