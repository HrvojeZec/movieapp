import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEmailSender } from "@/server/email/sender";
import { CaptureSender } from "@/server/email/capture-sender";
import { GmailSender } from "@/server/email/gmail-sender";
import { NoopSender } from "@/server/email/noop-sender";

describe("getEmailSender", () => {
  beforeEach(() => {
    for (const name of ["EMAIL_TRANSPORT", "SMTP_USER", "SMTP_APP_PASSWORD"]) {
      vi.stubEnv(name, undefined);
    }
  });

  it("uses the capture sender in E2E", () => {
    vi.stubEnv("EMAIL_TRANSPORT", "capture");
    vi.stubEnv("SMTP_USER", "app@gmail.com");
    vi.stubEnv("SMTP_APP_PASSWORD", "app-password");
    expect(getEmailSender()).toBeInstanceOf(CaptureSender);
  });

  it("sends through Gmail when SMTP is configured", () => {
    vi.stubEnv("SMTP_USER", "app@gmail.com");
    vi.stubEnv("SMTP_APP_PASSWORD", "app-password");
    expect(getEmailSender()).toBeInstanceOf(GmailSender);
  });

  it("skips sending without SMTP settings", () => {
    expect(getEmailSender()).toBeInstanceOf(NoopSender);
    vi.stubEnv("SMTP_USER", "app@gmail.com");
    expect(getEmailSender()).toBeInstanceOf(NoopSender);
  });
});
