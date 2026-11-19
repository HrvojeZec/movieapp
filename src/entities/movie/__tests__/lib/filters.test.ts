import { describe, expect, it } from "vitest";
import { buildYearOptions, parseNumberParam, updateQuery } from "@/entities/movie/lib/filters";

describe("parseNumberParam", () => {
  it.each([
    ["2024", 2024],
    ["7.5", 7.5],
    ["0", 0],
  ])("parses %j", (value, expected) => {
    expect(parseNumberParam(value)).toBe(expected);
  });

  it.each([null, "", "abc", "Infinity"])("ignores %j", (value) => {
    expect(parseNumberParam(value)).toBeUndefined();
  });
});

describe("buildYearOptions", () => {
  it("lists the most recent years, newest first", () => {
    expect(buildYearOptions(2026, 3)).toEqual([
      { value: "2026", label: "2026" },
      { value: "2025", label: "2025" },
      { value: "2024", label: "2024" },
    ]);
  });
});

describe("updateQuery", () => {
  it("sets, replaces and removes parameters and keeps the others", () => {
    expect(updateQuery("year=2024&genre=28&page=2", { year: "2025", genre: null })).toBe(
      "year=2025&page=2",
    );
  });

  it("treats an empty string as removing the parameter", () => {
    expect(updateQuery("rating=7", { rating: "" })).toBe("");
  });

  it("clears every filter at once", () => {
    expect(
      updateQuery("year=2027&genre=12&rating=0.4", { year: null, genre: null, rating: null }),
    ).toBe("");
  });
});
