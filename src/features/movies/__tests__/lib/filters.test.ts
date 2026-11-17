import { describe, expect, it } from "vitest";
import { buildYearOptions, parseNumberParam } from "@/features/movies/lib/filters";

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
