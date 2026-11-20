import type { NotificationType } from "@/entities/notification/types";

// The email button for each notification; DEFAULT_EMAIL_ACTION_LABEL when a type has none here
export const EMAIL_ACTION_LABELS: Partial<Record<NotificationType, string>> = {
  welcome: "Start browsing",
  plan_activated: "See your plan",
  trial_started: "See your plan",
  plan_changed: "See your plan",
  subscription_canceled: "Manage your subscription",
  subscription_resumed: "See your plan",
  subscription_ended: "See plans",
  payment_failed: "Update payment method",
  renewal_reminder: "Manage your subscription",
  ending_reminder: "Resume your subscription",
  trial_ending: "Manage your subscription",
  password_changed: "Open your profile",
};

export const DEFAULT_EMAIL_ACTION_LABEL = "Open MovieHub";
