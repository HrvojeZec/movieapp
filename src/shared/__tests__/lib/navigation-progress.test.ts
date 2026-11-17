import { describe, expect, it } from "vitest";
import { isNewDestination } from "@/shared/lib/navigation-progress";

const CURRENT = "http://localhost:3000/most-watched?genre=28";

describe("isNewDestination", () => {
  it.each([
    ["another page", "/movie/550"],
    ["the same page with another query", "/most-watched?genre=35"],
    ["the same page without the query", "/most-watched"],
    ["an absolute URL on the same origin", "http://localhost:3000/"],
  ])("is true for %s", (_, href) => {
    expect(isNewDestination(href, CURRENT)).toBe(true);
  });

  it.each([
    ["the current URL", "/most-watched?genre=28"],
    ["a hash on the current page", "/most-watched?genre=28#cast"],
    ["another origin", "https://www.themoviedb.org/"],
    ["an unparsable current URL", "/movie/550", "not a url"],
  ])("is false for %s", (_, href, current = CURRENT) => {
    expect(isNewDestination(href, current)).toBe(false);
  });
});
