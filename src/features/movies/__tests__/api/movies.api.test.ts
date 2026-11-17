import { describe, expect, it, vi } from "vitest";
import { discoverMovies, getMovieDetails } from "@/features/movies/api/movies.api";

describe("client fetchers", () => {
  const mockFetch = (response: Response) => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  it("call our API instead of TMDB and omit unset filters", async () => {
    const fetchMock = mockFetch(Response.json({ results: [] }));

    await discoverMovies({ genre: 28, page: 2 });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/movies/discover?genre=28&page=2");
  });

  it("throw an HttpError with the API's message so callers can show an error state", async () => {
    mockFetch(Response.json({ message: "Movie service unavailable" }, { status: 502 }));

    await expect(getMovieDetails(550)).rejects.toMatchObject({
      name: "HttpError",
      status: 502,
      message: "Movie service unavailable",
    });
  });
});
