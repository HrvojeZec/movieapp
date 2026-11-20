import { expect } from "@playwright/test";
import { getE2EDatabase } from "./db";

export interface CapturedEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: Date;
}

async function findLastEmail(to: string, subject?: string): Promise<CapturedEmail | null> {
  const connection = await getE2EDatabase();
  return connection
    .collection<CapturedEmail>("capturedemails")
    .findOne({ to, ...(subject && { subject }) }, { sort: { sentAt: -1 } });
}

/**
 * The latest email the app "sent" to this address, optionally with this exact subject. The E2E
 * server stores emails instead of sending them (EMAIL_TRANSPORT=capture); some go out after the
 * response (the welcome email), so this waits a little.
 */
export async function getLastEmail(to: string, subject?: string): Promise<CapturedEmail> {
  let email: CapturedEmail | null = null;
  await expect
    .poll(async () => (email = await findLastEmail(to, subject)), {
      message: `an email to ${to}${subject ? ` with the subject "${subject}"` : ""}`,
    })
    .not.toBeNull();
  return email!;
}

/** Every email the app "sent" to this address so far. */
export async function getEmails(to: string): Promise<CapturedEmail[]> {
  const connection = await getE2EDatabase();
  return connection.collection<CapturedEmail>("capturedemails").find({ to }).toArray();
}
