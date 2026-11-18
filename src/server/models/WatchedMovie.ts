import mongoose, { Document, Schema } from "mongoose";

// A separate collection instead of an array on User: a viewing history can grow long, and the
// session (which carries favorites and the watchlist) should stay small
export interface IWatchedMovie extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: string;
  watchedAt: Date;
  /** TMDB genre IDs at the time, for recommendations and stats without a TMDB call per movie. */
  genreIds: number[];
}

const WatchedMovieSchema = new Schema<IWatchedMovie>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  movieId: { type: String, required: true, trim: true },
  watchedAt: { type: Date, required: true },
  genreIds: { type: [Number], default: [] },
});

// Each movie once per user
WatchedMovieSchema.index({ userId: 1, movieId: 1 }, { unique: true });
// The history page, newest first
WatchedMovieSchema.index({ userId: 1, watchedAt: -1 });

const WatchedMovie =
  (mongoose.models.WatchedMovie as mongoose.Model<IWatchedMovie>) ||
  mongoose.model<IWatchedMovie>("WatchedMovie", WatchedMovieSchema);

export default WatchedMovie;
