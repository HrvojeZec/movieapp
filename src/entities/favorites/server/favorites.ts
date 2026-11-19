import type { QueryFilter, UpdateQuery } from "mongoose";
import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { logUserActivity } from "@/server/activity";
import { RouteError, notFound } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { FAVORITES_LIMIT } from "@/entities/subscription/constants";
import { getEffectivePlan, getFavoritesLimit } from "@/entities/subscription/lib/entitlements";

export const FAVORITES_LIMIT_MESSAGE = `The free plan allows up to ${FAVORITES_LIMIT} favorites. Upgrade to Premium for unlimited favorites.`;

// Atomic $addToSet/$pull instead of overwriting the whole array, so concurrent changes
// (e.g. two tabs) can't drop each other's favorites. Returns null if no document matched.
async function updateFavorites(
  filter: QueryFilter<IUser>,
  update: UpdateQuery<IUser>,
): Promise<string[] | null> {
  const user = await User.findOneAndUpdate(filter, update, {
    returnDocument: "after",
    projection: { favorites: 1 },
  });
  return user ? user.favorites : null;
}

async function addFavorite(userId: string, movieId: string): Promise<string[]> {
  const user = await User.findById(userId).select("subscriptionStatus subscriptionPlan");
  if (!user) throw notFound("User");

  const limit = getFavoritesLimit(getEffectivePlan(user));
  // The limit is part of the update's filter: the slot after the last allowed one must still be
  // empty. Checking the count first and adding afterwards would let parallel requests overshoot.
  // A movie that is already a favorite matches anyway, so re-adding it is never refused.
  const filter: QueryFilter<IUser> =
    limit === null
      ? { _id: userId }
      : {
          _id: userId,
          $or: [{ favorites: movieId }, { [`favorites.${limit - 1}`]: { $exists: false } }],
        };

  const favorites = await updateFavorites(filter, { $addToSet: { favorites: movieId } });
  if (favorites) return favorites;

  // The filter didn't match: the list is full, unless the user was deleted in the meantime
  if (!(await User.exists({ _id: userId }))) throw notFound("User");
  throw new RouteError(HTTP_STATUS.FORBIDDEN, FAVORITES_LIMIT_MESSAGE);
}

// Always allowed, even over the limit (e.g. after a downgrade), so a full list can be trimmed
async function removeFavorite(userId: string, movieId: string): Promise<string[]> {
  const favorites = await updateFavorites({ _id: userId }, { $pull: { favorites: movieId } });
  if (!favorites) throw notFound("User");
  return favorites;
}

/** Adds or removes a favorite, logs the activity and returns the updated list. */
export async function setFavorite(userId: string, movieId: string, add: boolean) {
  await connectDB();
  const favorites = await (add ? addFavorite : removeFavorite)(userId, movieId);

  await logUserActivity(userId, add ? "favorite" : "unfavorite", movieId);
  return favorites;
}
