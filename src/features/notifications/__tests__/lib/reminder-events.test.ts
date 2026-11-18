import { describe, expect, it } from "vitest";
import { getReminderNotification } from "@/features/notifications/lib/reminder-events";
import type { DueReminder } from "@/features/subscription/lib/reminders";

const reminder = (overrides: Partial<DueReminder> = {}): DueReminder => ({
  userId: "user-1",
  type: "renewal_reminder",
  date: new Date("2026-11-21T12:00:00Z"),
  plan: "premium",
  interval: "month",
  dedupeKey: "renewal_reminder:sub_123:2026-11-21",
  ...overrides,
});

describe("getReminderNotification", () => {
  it("tells when a plan renews and for how much", () => {
    expect(getReminderNotification(reminder())).toMatchObject({
      type: "renewal_reminder",
      title: "Premium renews on November 21, 2026",
      dedupeKey: "renewal_reminder:sub_123:2026-11-21",
      link: "/profile",
    });
    expect(getReminderNotification(reminder()).body).toContain("$9.99");
  });

  it("uses the yearly price for a yearly plan", () => {
    expect(getReminderNotification(reminder({ interval: "year" })).body).toContain("$99.90");
  });

  it("lists what a canceled plan loses when it ends", () => {
    const notification = getReminderNotification(
      reminder({ type: "ending_reminder", plan: "pro" }),
    );
    expect(notification.title).toBe("Pro ends on November 21, 2026");
    expect(notification.body).toContain("Recommendations");
    expect(notification.body).toContain("resume");
  });

  it("warns before a trial turns into a paid subscription", () => {
    const notification = getReminderNotification(reminder({ type: "trial_ending" }));
    expect(notification).toMatchObject({
      type: "trial_ending",
      title: "Your free trial ends soon",
    });
    expect(notification.body).toContain("November 21, 2026");
  });
});
