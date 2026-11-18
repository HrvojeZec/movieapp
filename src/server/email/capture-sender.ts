import connectDB from "@/server/db/mongodb";
import type { EmailMessage, EmailSender } from "./types";

// E2E tests read the emails from this collection instead of a real inbox
export const CAPTURED_EMAILS_COLLECTION = "capturedemails";

/** Stores emails in the database instead of sending them (EMAIL_TRANSPORT=capture, E2E only). */
export class CaptureSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    const { connection } = await connectDB();
    await connection.collection(CAPTURED_EMAILS_COLLECTION).insertOne({
      ...message,
      sentAt: new Date(),
    });
  }
}
