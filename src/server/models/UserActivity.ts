import mongoose, { Document, Schema } from "mongoose";
import { STATS_DAYS } from "@/features/stats/constants";
import { DAY_IN_SECONDS } from "@/shared/lib/time";

// Kept a little past the year the stats read, then MongoDB deletes it (the free tier is small)
const ACTIVITY_TTL_DAYS = STATS_DAYS + 35;

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

// Every read is one user's activity of some kinds, often within a time range (stats, views)
UserActivitySchema.index({ userId: 1, action: 1, createdAt: -1 });
UserActivitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: ACTIVITY_TTL_DAYS * DAY_IN_SECONDS },
);

const UserActivity =
  (mongoose.models.UserActivity as mongoose.Model<IUserActivity>) ||
  mongoose.model<IUserActivity>("UserActivity", UserActivitySchema);

export default UserActivity;
