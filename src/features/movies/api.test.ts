import { describe, expect, it, vi } from "vitest";
import { discoverMovies, getImageUrl, getMovieDetails, getTrailerUrl, type Video } from "./api";

const video = (overrides: Partial<Video>): Video => ({
  id: "v",
  key: "key",
  name: "Video",
  site: "YouTube",
  type: "Trailer",
  official: false,
  published_at: "2024-01-01",
  ...overrides,
});

describe("getImageUrl", () => {
  it("builds a TMDB CDN URL with the requested size", () => {
    expect(getImageUrl("/abc.jpg", "w200")).toBe("https://image.tmdb.org/t/p/w200/abc.jpg");
  });

  it("defaults to w500", () => {
    expect(getImageUrl("/abc.jpg")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
  });

  it("falls back to the local placeholder when there is no poster", () => {
    expect(getImageUrl(null)).toBe("/placeholder-movie.svg");
  });
});

describe("getTrailerUrl", () => {
  it("prefers the official YouTube trailer", () => {
    const videos = [video({ key: "fan" }), video({ key: "official", official: true })];
    expect(getTrailerUrl(videos)).toBe("https://www.youtube.com/embed/official?autoplay=1&rel=0");
  });

  it("falls back to any YouTube trailer", () => {
    expect(getTrailerUrl([video({ key: "fan" })])).toContain("/embed/fan?");
  });

  it("ignores teasers and non-YouTube videos", () => {
    const videos = [video({ type: "Teaser", official: true }), video({ site: "Vimeo" })];
    expect(getTrailerUrl(videos)).toBeNull();
  });
});

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
