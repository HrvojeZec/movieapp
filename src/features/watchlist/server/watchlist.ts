import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";
import { logUserActivity } from "@/server/activity";
import { notFound } from "@/server/http/route-error";
import { requireFeature } from "@/features/subscription/server/entitlements";

/**
 * Adds a movie to the watchlist (Premium and Pro, 403 otherwise) or removes it (always allowed,
 * so a downgraded account can still tidy up). Atomic like favorites; returns the updated list.
 */
export async function setWatchlist(userId: string, movieId: string, add: boolean) {
  await connectDB();
  if (add) await requireFeature(userId, "watchlist");

  const user = await User.findByIdAndUpdate(
    userId,
    add ? { $addToSet: { watchlist: movieId } } : { $pull: { watchlist: movieId } },
    { returnDocument: "after", projection: { watchlist: 1 } },
  );
  if (!user) throw notFound("User");

  await logUserActivity(userId, add ? "watchlist_add" : "watchlist_remove", movieId);
  return user.watchlist;
}
