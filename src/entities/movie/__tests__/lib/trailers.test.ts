import { describe, expect, it } from "vitest";
import { getTrailerUrl } from "@/entities/movie/lib/trailers";
import type { Video } from "@/entities/movie/types";

// YouTube video IDs are 11 characters long
const FAN_KEY = "fanTrailer1";
const OFFICIAL_KEY = "Official-_1";

const video = (overrides: Partial<Video>): Video => ({
  id: "v",
  key: FAN_KEY,
  name: "Video",
  site: "YouTube",
  type: "Trailer",
  official: false,
  published_at: "2024-01-01",
  ...overrides,
});

describe("getTrailerUrl", () => {
  it("prefers the official YouTube trailer", () => {
    const videos = [video({ key: FAN_KEY }), video({ key: OFFICIAL_KEY, official: true })];
    expect(getTrailerUrl(videos)).toBe(
      `https://www.youtube.com/embed/${OFFICIAL_KEY}?autoplay=1&rel=0`,
    );
  });

  it("falls back to any YouTube trailer", () => {
    expect(getTrailerUrl([video({ key: FAN_KEY })])).toContain(`/embed/${FAN_KEY}?`);
  });

  it("ignores teasers and non-YouTube videos", () => {
    const videos = [video({ type: "Teaser", official: true }), video({ site: "Vimeo" })];
    expect(getTrailerUrl(videos)).toBeNull();
  });

  it("skips a trailer whose key isn't a YouTube video ID", () => {
    // TMDB's video entries are added by its users, so the key ends up in our iframe URL untrusted
    const videos = [
      video({ key: "../../logout", official: true }),
      video({ key: "abc?autoplay", official: true }),
      video({ key: FAN_KEY }),
    ];
    expect(getTrailerUrl(videos)).toBe(`https://www.youtube.com/embed/${FAN_KEY}?autoplay=1&rel=0`);
    expect(getTrailerUrl([video({ key: "short" })])).toBeNull();
  });
});
