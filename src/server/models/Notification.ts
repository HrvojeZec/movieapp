import mongoose, { Document, Schema } from "mongoose";
import { NOTIFICATION_TTL_DAYS, NOTIFICATION_TYPES } from "@/features/notifications/constants";
import type { NotificationType } from "@/features/notifications/types";
import { DAY_IN_SECONDS } from "@/shared/lib/time";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  dedupeKey: string;
  readAt: Date | null;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    dedupeKey: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// One notification per event and user: a webhook delivered twice can't notify twice
NotificationSchema.index({ userId: 1, dedupeKey: 1 }, { unique: true });
// The bell lists a user's latest notifications
NotificationSchema.index({ userId: 1, createdAt: -1 });
// MongoDB deletes old notifications on its own
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: NOTIFICATION_TTL_DAYS * DAY_IN_SECONDS },
);

const Notification =
  (mongoose.models.Notification as mongoose.Model<INotification>) ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
