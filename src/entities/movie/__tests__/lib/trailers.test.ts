import { describe, expect, it } from "vitest";
import { getTrailerUrl } from "@/entities/movie/lib/trailers";
import type { Video } from "@/entities/movie/types";

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
