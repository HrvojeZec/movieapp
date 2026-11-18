import { describe, expect, it } from "vitest";
import { toggleId } from "@/shared/lib/id-list";

describe("toggleId", () => {
  it("adds an ID once, at the end", () => {
    expect(toggleId(["1"], "2", true)).toEqual(["1", "2"]);
    expect(toggleId(["1", "2"], "1", true)).toEqual(["2", "1"]);
  });

  it("removes an ID, and ignores one that isn't there", () => {
    expect(toggleId(["1", "2"], "1", false)).toEqual(["2"]);
    expect(toggleId(["2"], "1", false)).toEqual(["2"]);
  });
});
