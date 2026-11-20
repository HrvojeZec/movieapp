import { describe, expect, it } from "vitest";
import {
  getDueReminders,
  reminderDedupeKey,
  type ReminderCandidate,
} from "@/entities/subscription/lib/reminders";

const NOW = new Date("2026-11-18T07:00:00Z");
const inDays = (days: number) => new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);

const candidate = (overrides: Partial<ReminderCandidate> = {}): ReminderCandidate => ({
  userId: "user-1",
  subscriptionId: "sub_123",
  subscriptionStatus: "active",
  subscriptionPlan: "premium",
  subscriptionInterval: "month",
  currentPeriodEnd: inDays(3),
  cancelAt: null,
  trialEnd: null,
  ...overrides,
});

describe("getDueReminders", () => {
  it("reminds 3 days before a renewal", () => {
    expect(getDueReminders([candidate()], NOW)).toEqual([
      expect.objectContaining({
        userId: "user-1",
        type: "renewal_reminder",
        date: inDays(3),
        plan: "premium",
        interval: "month",
      }),
    ]);
  });

  it("doesn't remind earlier than 3 days before", () => {
    expect(getDueReminders([candidate({ currentPeriodEnd: inDays(3.5) })], NOW)).toEqual([]);
  });

  it("reminds 1 day before when a run was missed", () => {
    expect(getDueReminders([candidate({ currentPeriodEnd: inDays(1) })], NOW)).toHaveLength(1);
  });

  it("reminds before a scheduled end instead of a renewal", () => {
    const [reminder] = getDueReminders([candidate({ cancelAt: inDays(2) })], NOW);
    expect(reminder).toMatchObject({ type: "ending_reminder", date: inDays(2) });
  });

  it("reminds before a trial ends", () => {
    const [reminder] = getDueReminders(
      [candidate({ subscriptionStatus: "trialing", trialEnd: inDays(2) })],
      NOW,
    );
    expect(reminder).toMatchObject({ type: "trial_ending", date: inDays(2) });
  });

  it("a canceled trial gets the ending reminder, not the trial one", () => {
    const [reminder] = getDueReminders(
      [candidate({ subscriptionStatus: "trialing", trialEnd: inDays(2), cancelAt: inDays(2) })],
      NOW,
    );
    expect(reminder.type).toBe("ending_reminder");
  });

  it("ignores free and already ended subscriptions", () => {
    expect(
      getDueReminders(
        [
          candidate({ subscriptionStatus: "canceled", subscriptionPlan: "basic" }),
          candidate({ subscriptionPlan: "basic" }),
          candidate({ currentPeriodEnd: inDays(-1) }),
          candidate({ subscriptionId: undefined }),
        ],
        NOW,
      ),
    ).toEqual([]);
  });

  it("uses a stable dedupe key per period", () => {
    const first = getDueReminders([candidate()], NOW)[0];
    const nextDay = getDueReminders([candidate()], inDays(1))[0];

    expect(first.dedupeKey).toBe("renewal_reminder:sub_123:2026-11-21");
    expect(nextDay.dedupeKey).toBe(first.dedupeKey);
  });
});

describe("reminderDedupeKey", () => {
  it("uses the UTC calendar day, so the webhook and the cron agree", () => {
    expect(reminderDedupeKey("trial_ending", "sub_9", new Date("2026-12-01T23:30:00Z"))).toBe(
      "trial_ending:sub_9:2026-12-01",
    );
  });
});
