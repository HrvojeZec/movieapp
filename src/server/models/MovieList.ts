import mongoose, { Document, Schema } from "mongoose";
import { LIST_NAME_MAX_LENGTH } from "@/entities/movie-list/constants";

export interface IMovieList extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  /** TMDB movie IDs in the order they were added. */
  movieIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MovieListSchema = new Schema<IMovieList>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: LIST_NAME_MAX_LENGTH },
    movieIds: { type: [{ type: String, trim: true }], default: [] },
  },
  { timestamps: true },
);

// The lists page: a user's lists, recently changed first
MovieListSchema.index({ userId: 1, updatedAt: -1 });

const MovieList =
  (mongoose.models.MovieList as mongoose.Model<IMovieList>) ||
  mongoose.model<IMovieList>("MovieList", MovieListSchema);

export default MovieList;
