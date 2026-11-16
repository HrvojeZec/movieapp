import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { searchParamsToObject, tmdbErrorResponse, tmdbJson } from "./route-helpers";
import { TmdbError } from "./tmdb";

describe("tmdbJson", () => {
  it("lets the CDN cache successful responses", async () => {
    const response = tmdbJson({ results: [] });
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );
    expect(await response.json()).toEqual({ results: [] });
  });
});

describe("tmdbErrorResponse", () => {
  it("maps invalid parameters to 400", () => {
    const zodError = z.object({ page: z.number() }).safeParse({ page: "x" }).error;
    expect(tmdbErrorResponse(zodError, "test").status).toBe(400);
  });

  it("maps a TMDB 404 to 404", () => {
    expect(tmdbErrorResponse(new TmdbError("missing", 404), "test").status).toBe(404);
  });

  it("maps other failures to 502 without leaking details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = tmdbErrorResponse(new Error("TMDB_API_KEY is not set"), "test");
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ message: "Movie service unavailable" });
  });
});

describe("searchParamsToObject", () => {
  it("turns query parameters into a plain object for zod", () => {
    expect(searchParamsToObject("http://localhost/api/movies?list=popular&page=2")).toEqual({
      list: "popular",
      page: "2",
    });
  });
});
