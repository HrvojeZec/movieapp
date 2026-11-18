import { expect } from "@playwright/test";
import { getE2EDatabase } from "./db";

export interface CapturedEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: Date;
}

async function findLastEmail(to: string): Promise<CapturedEmail | null> {
  const connection = await getE2EDatabase();
  return connection
    .collection<CapturedEmail>("capturedemails")
    .findOne({ to }, { sort: { sentAt: -1 } });
}

/**
 * The latest email the app "sent" to this address. The E2E server stores emails instead of
 * sending them (EMAIL_TRANSPORT=capture); some go out after the response, so this waits a little.
 */
export async function getLastEmail(to: string): Promise<CapturedEmail> {
  let email: CapturedEmail | null = null;
  await expect
    .poll(async () => (email = await findLastEmail(to)), { message: `an email to ${to}` })
    .not.toBeNull();
  return email!;
}
