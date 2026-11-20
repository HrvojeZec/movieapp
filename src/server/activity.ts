import connectDB from "@/server/db/mongodb";
import UserActivity, { type ActivityAction } from "@/server/models/UserActivity";

/**
 * Removes the TMDB genres older versions stored with page views and watched movies. Nothing reads
 * them, and TMDB's terms limit how long its data may be kept. Returns how many entries changed.
 */
export async function purgeActivityGenres(): Promise<number> {
  await connectDB();
  const { modifiedCount } = await UserActivity.updateMany(
    { "metadata.genreIds": { $exists: true } },
    { $unset: { "metadata.genreIds": "" } },
  );
  return modifiedCount;
}

// Best effort: activity logging must never break the request that triggered it.
export const logUserActivity = async (
  userId: string,
  action: ActivityAction,
  movieId?: string,
  searchQuery?: string,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  try {
    await connectDB();
    await UserActivity.create({
      userId,
      action,
      movieId,
      searchQuery,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
};
