import { describe, expect, it } from "vitest";
import { formatDate, formatRuntime, formatYear } from "@/shared/lib/format";

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

describe("formatDate", () => {
  it("formats a date with the full month name", () => {
    expect(formatDate("2026-11-17T12:00:00")).toBe("November 17, 2026");
  });
});
