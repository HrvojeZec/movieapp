import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatRuntime,
  formatWait,
  formatYear,
  pluralize,
  truncate,
} from "@/shared/lib/format";

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

describe("truncate", () => {
  it("keeps text that fits", () => {
    expect(truncate("Short text", 20)).toBe("Short text");
  });

  it("cuts at a word boundary and adds an ellipsis", () => {
    expect(truncate("The quick brown fox jumps", 15)).toBe("The quick…");
  });

  it("cuts a single long word", () => {
    expect(truncate("Supercalifragilistic", 10)).toBe("Supercali…");
  });
});

describe("pluralize", () => {
  it.each([
    [0, "favorites"],
    [1, "favorite"],
    [2, "favorites"],
  ])("uses the right form for %i", (count, expected) => {
    expect(pluralize(count, "favorite")).toBe(expected);
  });

  it("accepts an irregular plural", () => {
    expect(pluralize(2, "person", "people")).toBe("people");
  });
});

describe("formatWait", () => {
  it.each([
    [1, "1 second"],
    [45, "45 seconds"],
    [60, "1 minute"],
    [61, "2 minutes"],
    [900, "15 minutes"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatWait(seconds)).toBe(expected);
  });
});
