import { describe, expect, it } from "vitest";
import { advancedDiscoverQuerySchema } from "@/features/movies/validations/movies.schema";

const parse = (query: Record<string, string>) => advancedDiscoverQuerySchema.safeParse(query);

describe("advancedDiscoverQuerySchema", () => {
  it("parses every advanced filter from query strings, with the basic ones", () => {
    expect(
      advancedDiscoverQuerySchema.parse({
        yearFrom: "1990",
        yearTo: "1999",
        genres: "18,53,18",
        runtimeMin: "90",
        runtimeMax: "150",
        language: "en",
        sortBy: "vote_average.desc",
        minVotes: "500",
        minRating: "7",
        page: "2",
      }),
    ).toEqual({
      yearFrom: 1990,
      yearTo: 1999,
      genres: [18, 53],
      runtimeMin: 90,
      runtimeMax: 150,
      language: "en",
      sortBy: "vote_average.desc",
      minVotes: 500,
      minRating: 7,
      page: 2,
    });
  });

  it("rejects yearFrom after yearTo", () => {
    expect(parse({ yearFrom: "2000", yearTo: "1990" }).success).toBe(false);
    expect(parse({ yearFrom: "1990", yearTo: "1990" }).success).toBe(true);
  });

  it("rejects a minimum runtime above the maximum", () => {
    expect(parse({ runtimeMin: "120", runtimeMax: "90" }).success).toBe(false);
  });

  it("rejects an unknown sort", () => {
    expect(parse({ sortBy: "revenue.desc" }).success).toBe(false);
  });

  it.each(["english", "EN", "e1"])("rejects the language %j (ISO 639-1 only)", (language) => {
    expect(parse({ language }).success).toBe(false);
  });

  it.each(["", "18,,53", "18|53", "-1", "action"])("rejects the genre list %j", (genres) => {
    expect(parse({ genres }).success).toBe(false);
  });

  it.each([
    ["yearFrom", "1800"],
    ["runtimeMax", "1000"],
    ["minVotes", "-5"],
  ])("rejects %s=%s outside its range", (key, value) => {
    expect(parse({ [key]: value }).success).toBe(false);
  });
});
