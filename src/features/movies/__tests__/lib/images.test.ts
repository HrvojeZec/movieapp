import { describe, expect, it } from "vitest";
import { getImageUrl } from "@/features/movies/lib/images";

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
