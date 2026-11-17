import { describe, expect, it } from "vitest";
import { applyFavoriteChange } from "@/features/favorites/lib/favorites";

describe("applyFavoriteChange", () => {
  it("adds a movie once", () => {
    expect(applyFavoriteChange(["1"], "2", true)).toEqual(["1", "2"]);
    expect(applyFavoriteChange(["1", "2"], "2", true)).toEqual(["1", "2"]);
  });

  it("removes a movie and ignores one that isn't there", () => {
    expect(applyFavoriteChange(["1", "2"], "1", false)).toEqual(["2"]);
    expect(applyFavoriteChange(["2"], "1", false)).toEqual(["2"]);
  });
});
