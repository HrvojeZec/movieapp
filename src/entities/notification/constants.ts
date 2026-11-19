export const NOTIFICATION_TYPES = [
  "welcome",
  "plan_activated",
  "plan_changed",
  "subscription_canceled",
  "subscription_resumed",
  "subscription_ended",
  "payment_failed",
  "renewal_reminder",
  "ending_reminder",
  "trial_started",
  "trial_ending",
  "password_changed",
] as const;

// The bell shows the latest ones; older notifications are still counted as unread
export const NOTIFICATIONS_LIMIT = 20;

// Notifications delete themselves after this many days (TTL index on createdAt)
export const NOTIFICATION_TTL_DAYS = 90;

// How many notifications one "mark as read" request may name
export const MARK_READ_MAX_IDS = 50;
