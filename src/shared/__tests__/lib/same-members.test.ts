import { describe, expect, it } from "vitest";
import { sameMembers } from "@/shared/lib/same-members";

describe("sameMembers", () => {
  it("the same IDs in another order are the same members", () => {
    expect(sameMembers(["1", "2", "3"], ["3", "1", "2"])).toBe(true);
  });

  it("a missing or extra ID is not", () => {
    expect(sameMembers(["1", "2"], ["1"])).toBe(false);
    expect(sameMembers(["1"], ["1", "2"])).toBe(false);
  });

  it("a swapped ID is not", () => {
    expect(sameMembers(["1", "2"], ["1", "3"])).toBe(false);
  });

  it("duplicates don't make up for a missing ID", () => {
    expect(sameMembers(["1", "1"], ["1", "2"])).toBe(false);
    expect(sameMembers([], [])).toBe(true);
  });
});
