import { describe, expect, it } from "vitest";
import { RouteError, notFound } from "@/server/http/route-error";

describe("notFound", () => {
  it("builds a 404 RouteError naming the missing resource", () => {
    const error = notFound("Checkout session");

    expect(error).toBeInstanceOf(RouteError);
    expect(error).toMatchObject({ status: 404, message: "Checkout session not found" });
  });
});
