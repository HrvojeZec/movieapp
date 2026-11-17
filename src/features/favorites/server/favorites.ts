import type { UpdateQuery } from "mongoose";
import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { logUserActivity } from "@/server/activity";
import { notFound } from "@/server/http/route-error";

// Atomic $addToSet/$pull instead of overwriting the whole array, so concurrent changes
// (e.g. two tabs) can't drop each other's favorites. Returns null if the user doesn't exist.
async function updateFavorites(
  userId: string,
  update: UpdateQuery<IUser>,
): Promise<string[] | null> {
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    projection: { favorites: 1 },
  });
  return user ? user.favorites : null;
}

const addFavorite = (userId: string, movieId: string) =>
  updateFavorites(userId, { $addToSet: { favorites: movieId } });

const removeFavorite = (userId: string, movieId: string) =>
  updateFavorites(userId, { $pull: { favorites: movieId } });

/** Adds or removes a favorite, logs the activity and returns the updated list. */
export async function setFavorite(userId: string, movieId: string, add: boolean) {
  const favorites = await (add ? addFavorite : removeFavorite)(userId, movieId);
  if (!favorites) {
    throw notFound("User");
  }

  await logUserActivity(userId, add ? "favorite" : "unfavorite", movieId);
  return favorites;
}
