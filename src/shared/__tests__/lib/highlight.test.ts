import { describe, expect, it } from "vitest";
import { highlightMatch } from "@/shared/lib/highlight";

describe("highlightMatch", () => {
  it("marks every match, ignoring case", () => {
    expect(highlightMatch("Fight Club: the fight", "FIGHT")).toEqual([
      { text: "Fight", match: true },
      { text: " Club: the ", match: false },
      { text: "fight", match: true },
    ]);
  });

  it("no query marks nothing", () => {
    expect(highlightMatch("Fight Club", "")).toEqual([{ text: "Fight Club", match: false }]);
    expect(highlightMatch("Fight Club", "   ")).toEqual([{ text: "Fight Club", match: false }]);
  });

  it("treats the query as plain text, not a pattern", () => {
    expect(highlightMatch("Mission: Impossible (1996)", "(1996)")).toEqual([
      { text: "Mission: Impossible ", match: false },
      { text: "(1996)", match: true },
    ]);
  });

  it("matches the trimmed query", () => {
    expect(highlightMatch("Up", " up ")).toEqual([{ text: "Up", match: true }]);
  });
});
