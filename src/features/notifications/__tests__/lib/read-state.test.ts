import { describe, expect, it } from "vitest";
import { markReadLocally } from "@/features/notifications/lib/read-state";
import type { NotificationDto } from "@/features/notifications/types";

const notification = (id: string, read: boolean): NotificationDto => ({
  id,
  type: "payment_failed",
  title: "Payment failed",
  body: "Update your card.",
  read,
  createdAt: "2026-11-18T10:00:00.000Z",
});

// 2 unread shown, plus 3 older unread ones beyond the latest 20
const state = {
  notifications: [notification("a", false), notification("b", false), notification("c", true)],
  unreadCount: 5,
};

describe("markReadLocally", () => {
  it("marks the given notifications and lowers the count by the unread ones among them", () => {
    const next = markReadLocally(state, { ids: ["a", "c"] });
    expect(next.notifications.map((n) => n.read)).toEqual([true, false, true]);
    expect(next.unreadCount).toBe(4);
  });

  it("marks everything as read", () => {
    const next = markReadLocally(state, { all: true });
    expect(next.notifications.every((n) => n.read)).toBe(true);
    expect(next.unreadCount).toBe(0);
  });
});
