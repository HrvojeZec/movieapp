import type { NotificationInput } from "@/features/notifications/types";
import { APP_NAME } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";

/** Greets a new account in the bell and by email; sent once per user. */
export const getWelcomeNotification = (): NotificationInput => ({
  type: "welcome",
  title: `Welcome to ${APP_NAME}`,
  body: "Search any movie, watch trailers and save favorites. Premium adds a watchlist, custom lists and advanced filters; Pro adds recommendations and viewing statistics.",
  link: ROUTES.home,
  dedupeKey: "welcome",
});
