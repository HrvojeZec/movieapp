import { getAppUrl } from "@/server/app-url";
import type { EmailMessage } from "@/server/email/types";
import { ROUTES } from "@/shared/routes";
import {
  DEFAULT_EMAIL_ACTION_LABEL,
  EMAIL_ACTION_LABELS,
} from "@/features/notifications/emails/constants";
import { renderEmail } from "@/features/notifications/emails/render";
import type { NotificationInput } from "@/features/notifications/types";

export interface EmailRecipient {
  name: string;
  email: string;
}

/** The email that goes with a notification: the same title and words, a button to its page. */
export function buildNotificationEmail(
  notification: NotificationInput,
  recipient: EmailRecipient,
): EmailMessage {
  const appUrl = getAppUrl();
  const { html, text } = renderEmail({
    preview: notification.body,
    heading: notification.title,
    greeting: `Hi ${recipient.name},`,
    paragraphs: [notification.body],
    action: notification.link
      ? {
          label: EMAIL_ACTION_LABELS[notification.type] ?? DEFAULT_EMAIL_ACTION_LABEL,
          url: `${appUrl}${notification.link}`,
        }
      : undefined,
    profileUrl: `${appUrl}${ROUTES.profile}`,
  });

  return { to: recipient.email, subject: notification.title, html, text };
}
