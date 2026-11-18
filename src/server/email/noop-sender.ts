import type { EmailMessage, EmailSender } from "./types";

/** Used when SMTP isn't configured (local development, CI): the app works, nothing is sent. */
export class NoopSender implements EmailSender {
  readonly countsTowardDailyLimit = false;

  async send(message: EmailMessage): Promise<void> {
    console.info(`Email not sent (SMTP is not configured): "${message.subject}" to ${message.to}`);
  }
}
