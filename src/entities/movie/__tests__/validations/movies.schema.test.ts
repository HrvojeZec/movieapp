import { describe, expect, it } from "vitest";
import {
  movieDiscoverQuerySchema,
  movieIdSchema,
  movieListQuerySchema,
  movieSearchQuerySchema,
} from "@/entities/movie/validations/movies.schema";

describe("movieListQuerySchema", () => {
  it("coerces the page from a query string and defaults it to 1", () => {
    expect(movieListQuerySchema.parse({ list: "popular", page: "3" })).toEqual({
      list: "popular",
      page: 3,
    });
    expect(movieListQuerySchema.parse({ list: "upcoming" }).page).toBe(1);
  });

  it("only allows known lists, so the TMDB path can't be chosen freely", () => {
    expect(movieListQuerySchema.safeParse({ list: "../account" }).success).toBe(false);
  });

  it.each(["0", "501", "1.5", "abc"])("rejects page %s (TMDB serves pages 1-500)", (page) => {
    expect(movieListQuerySchema.safeParse({ list: "popular", page }).success).toBe(false);
  });
});

describe("movieSearchQuerySchema", () => {
  it("trims the query", () => {
    expect(movieSearchQuerySchema.parse({ query: "  batman  " }).query).toBe("batman");
  });

  it.each(["", "   ", "x".repeat(101)])("rejects query %j", (query) => {
    expect(movieSearchQuerySchema.safeParse({ query }).success).toBe(false);
  });
});

describe("movieDiscoverQuerySchema", () => {
  it("coerces numeric filters and leaves missing ones undefined", () => {
    expect(movieDiscoverQuerySchema.parse({ genre: "28", minRating: "7.5" })).toEqual({
      genre: 28,
      minRating: 7.5,
      page: 1,
    });
  });

  it.each([
    ["year", "1800"],
    ["genre", "-1"],
    ["minRating", "11"],
  ])("rejects out-of-range %s", (key, value) => {
    expect(movieDiscoverQuerySchema.safeParse({ [key]: value }).success).toBe(false);
  });
});

describe("movieIdSchema", () => {
  it("accepts positive integer IDs", () => {
    expect(movieIdSchema.parse("550")).toBe(550);
  });

  it.each(["0", "-1", "1.5", "abc"])("rejects %s", (id) => {
    expect(movieIdSchema.safeParse(id).success).toBe(false);
  });
});
