import { CaptureSender } from "./capture-sender";
import { GmailSender } from "./gmail-sender";
import { NoopSender } from "./noop-sender";
import type { EmailSender } from "./types";

const DEFAULT_FROM_NAME = "MovieHub";

let gmail: { key: string; sender: GmailSender } | null = null;

/** Picks how emails leave the app; read per call, so env changes in tests take effect. */
export function getEmailSender(): EmailSender {
  if (process.env.EMAIL_TRANSPORT === "capture") return new CaptureSender();

  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_APP_PASSWORD;
  if (!user || !password) return new NoopSender();

  // One SMTP connection pool per account, reused across requests on a warm instance
  const fromName = process.env.EMAIL_FROM_NAME || DEFAULT_FROM_NAME;
  const key = `${user}:${fromName}`;
  if (gmail?.key !== key) gmail = { key, sender: new GmailSender(user, password, fromName) };
  return gmail.sender;
}
