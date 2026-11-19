import { getAppUrl } from "@/server/app-url";
import type { EmailMessage } from "@/server/email/types";
import { ROUTES } from "@/shared/routes";
import {
  DEFAULT_EMAIL_ACTION_LABEL,
  EMAIL_ACTION_LABELS,
} from "@/entities/notification/emails/constants";
import { renderEmail } from "@/entities/notification/emails/render";
import type { NotificationInput } from "@/entities/notification/types";

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

/** The email with a one-time link for choosing a new password. */
export function buildPasswordResetEmail(recipient: EmailRecipient, resetUrl: string): EmailMessage {
  const appUrl = getAppUrl();
  const subject = "Reset your MovieHub password";
  const { html, text } = renderEmail({
    preview: "Choose a new password with the link inside. It works once, for 1 hour.",
    heading: "Reset your password",
    greeting: `Hi ${recipient.name},`,
    paragraphs: [
      "Someone asked to reset the password of your MovieHub account. If it was you, choose a new one with the button below. The link works once and expires in 1 hour.",
      "If you didn't ask for this, ignore this email: your password stays the same.",
    ],
    action: { label: "Choose a new password", url: resetUrl },
    profileUrl: `${appUrl}${ROUTES.profile}`,
  });
  return { to: recipient.email, subject, html, text };
}
