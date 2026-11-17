import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/routes";

describe("ROUTES", () => {
  it("builds movie paths", () => {
    expect(ROUTES.movie(550)).toBe("/movie/550");
  });

  it("encodes the search query", () => {
    expect(ROUTES.search("fight club & co")).toBe("/search?q=fight%20club%20%26%20co");
  });

  it("links to the empty search page without a query", () => {
    expect(ROUTES.search()).toBe("/search");
    expect(ROUTES.search("")).toBe("/search");
  });
});
