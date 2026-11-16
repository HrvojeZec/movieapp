import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";

// Atomic $addToSet/$pull instead of overwriting the whole array, so concurrent changes
// (e.g. two tabs) can't drop each other's favorites. Returns null if the user doesn't exist.
export const addFavorite = async (userId: string, movieId: string): Promise<string[] | null> => {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: movieId } },
    { new: true, projection: { favorites: 1 } },
  );
  return user ? user.favorites : null;
};

export const removeFavorite = async (userId: string, movieId: string): Promise<string[] | null> => {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: movieId } },
    { new: true, projection: { favorites: 1 } },
  );
  return user ? user.favorites : null;
};
