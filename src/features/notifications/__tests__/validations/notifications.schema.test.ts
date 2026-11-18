import { describe, expect, it } from "vitest";
import { markReadSchema } from "@/features/notifications/validations/notifications.schema";

const ID = "507f1f77bcf86cd799439011";

describe("markReadSchema", () => {
  it("accepts a list of notification IDs", () => {
    expect(markReadSchema.safeParse({ ids: [ID] }).success).toBe(true);
  });

  it("accepts marking everything as read", () => {
    expect(markReadSchema.safeParse({ all: true }).success).toBe(true);
  });

  it.each([
    [{}],
    [{ ids: [] }],
    [{ ids: ["not-an-id"] }],
    [{ all: false }],
    [{ ids: Array.from({ length: 51 }, () => ID) }],
  ])("rejects %j", (body) => {
    expect(markReadSchema.safeParse(body).success).toBe(false);
  });
});
