import nodemailer, { type Transporter } from "nodemailer";
import type { EmailMessage, EmailSender } from "./types";

const GMAIL_SMTP = { host: "smtp.gmail.com", port: 465, secure: true } as const;

/**
 * Sends through a Gmail account with an App password: free, no domain needed, and every
 * recipient really gets the email. Gmail allows about 500 a day (see the "email" rate limit).
 */
export class GmailSender implements EmailSender {
  readonly countsTowardDailyLimit = true;
  private readonly transporter: Transporter;

  constructor(
    private readonly user: string,
    appPassword: string,
    private readonly fromName: string,
  ) {
    this.transporter = nodemailer.createTransport({
      ...GMAIL_SMTP,
      auth: { user, pass: appPassword },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: { name: this.fromName, address: this.user },
      ...message,
    });
  }
}
