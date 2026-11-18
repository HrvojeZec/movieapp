export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  /** Plain-text version for clients that don't show HTML (and for spam filters). */
  text: string;
}

/** Delivers an email: Gmail SMTP in production, a database record in E2E, a log line otherwise. */
export interface EmailSender {
  /** True when emails really leave the app and use up the provider's daily allowance. */
  readonly countsTowardDailyLimit: boolean;
  send(message: EmailMessage): Promise<void>;
}
