import { beforeEach, describe, expect, it, vi } from "vitest";
import { NOTIFICATION_TYPES } from "@/features/notifications/constants";
import { buildNotificationEmail } from "@/features/notifications/server/emails";
import type { NotificationInput, NotificationType } from "@/features/notifications/types";

const notification = (type: NotificationType): NotificationInput => ({
  type,
  title: `Title for ${type}`,
  body: `Body for ${type}, with "quotes" & ampersands.`,
  link: "/profile",
  dedupeKey: `test:${type}`,
});

const recipient = { name: "Ana", email: "ana@example.com" };

describe("buildNotificationEmail", () => {
  beforeEach(() => {
    vi.stubEnv("APP_URL", "https://movies.example.com");
  });

  it.each(NOTIFICATION_TYPES)("renders subject, html and text for %s", (type) => {
    const email = buildNotificationEmail(notification(type), recipient);

    expect(email.to).toBe("ana@example.com");
    expect(email.subject).toBe(`Title for ${type}`);
    expect(email.html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(email.html).toContain("Body for");
    expect(email.html).toContain('href="https://movies.example.com/profile"');
    expect(email.text).toContain(`Body for ${type}, with "quotes" & ampersands.`);
    expect(email.text).toContain("https://movies.example.com/profile");
  });

  it("greets the user by name and escapes it in the HTML", () => {
    const email = buildNotificationEmail(notification("welcome"), {
      name: "<b>Ana</b>",
      email: "ana@example.com",
    });

    expect(email.html).not.toContain("<b>Ana</b>");
    expect(email.html).toContain("&lt;b&gt;Ana&lt;/b&gt;");
    expect(email.text).toContain("Hi <b>Ana</b>,");
  });

  it("leaves out the button when the notification has no link", () => {
    const email = buildNotificationEmail(
      { ...notification("welcome"), link: undefined },
      recipient,
    );
    // The footer still links to the profile; only the button (labelled per type) is gone
    expect(email.html).not.toContain("Start browsing");
    expect(email.text).not.toContain("Start browsing");
  });
});
