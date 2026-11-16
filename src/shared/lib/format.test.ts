import { describe, expect, it } from "vitest";
import { formatRuntime, formatYear } from "./format";

describe("formatRuntime", () => {
  it.each([
    [139, "2h 19m"],
    [120, "2h"],
    [45, "45m"],
    [0, "N/A"],
    [-5, "N/A"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatRuntime(minutes)).toBe(expected);
  });
});

describe("formatYear", () => {
  it("extracts the year from a TMDB release date", () => {
    expect(formatYear("1999-10-15")).toBe("1999");
  });

  it("returns N/A for a missing date", () => {
    expect(formatYear("")).toBe("N/A");
  });
});
