import mongoose, { Document, Schema } from "mongoose";

export interface IUserActivity extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  action: string;
  movieId?: string;
  searchQuery?: string;
  createdAt: Date;
}

const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Korisnik je obavezan"],
    },
    action: {
      type: String,
      required: [true, "Akcija je obavezna"],
      enum: [
        "view",
        "favorite",
        "unfavorite",
        "search",
        "watchlist_add",
        "watchlist_remove",
      ],
    },
    movieId: {
      type: String,
      trim: true,
    },
    searchQuery: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const UserActivity =
  (mongoose.models.UserActivity as mongoose.Model<IUserActivity>) ||
  mongoose.model<IUserActivity>("UserActivity", UserActivitySchema);

export default UserActivity;
