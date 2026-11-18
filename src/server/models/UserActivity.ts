import mongoose, { Document, Schema } from "mongoose";

export const ACTIVITY_ACTIONS = [
  "register",
  "view",
  "favorite",
  "unfavorite",
  "search",
  "watchlist_add",
  "watchlist_remove",
  "watched",
  "unwatched",
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: ActivityAction;
  movieId?: string;
  searchQuery?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: ACTIVITY_ACTIONS,
    },
    movieId: {
      type: String,
      trim: true,
    },
    searchQuery: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const UserActivity =
  (mongoose.models.UserActivity as mongoose.Model<IUserActivity>) ||
  mongoose.model<IUserActivity>("UserActivity", UserActivitySchema);

export default UserActivity;
