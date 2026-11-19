import type { NotificationInput } from "@/entities/notification/types";
import { APP_NAME } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";

/** Confirms a password change, so an unexpected one gets noticed. */
export const getPasswordChangedNotification = (changedAt: Date): NotificationInput => ({
  type: "password_changed",
  title: "Your password was changed",
  body: 'The password of your MovieHub account was just changed. If it wasn\'t you, reset it right away with "Forgot password?" on the login page.',
  link: ROUTES.profile,
  dedupeKey: `password_changed:${changedAt.toISOString()}`,
});

/** Greets a new account in the bell and by email; sent once per user. */
export const getWelcomeNotification = (): NotificationInput => ({
  type: "welcome",
  title: `Welcome to ${APP_NAME}`,
  body: "Search any movie, watch trailers and save favorites. Premium adds a watchlist, custom lists and advanced filters; Pro adds recommendations and viewing statistics.",
  link: ROUTES.home,
  dedupeKey: "welcome",
});
