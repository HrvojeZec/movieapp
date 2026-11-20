import { describe, expect, it } from "vitest";
import { toApiError } from "@/shared/lib/api-error";
import { HttpError } from "@/shared/lib/http";

describe("toApiError", () => {
  it("keeps the message and field errors from an API error response", () => {
    const errors = [{ field: "email", message: "Invalid email" }];
    const error = new HttpError(400, "Validation failed", { message: "Validation failed", errors });

    expect(toApiError(error)).toEqual({ message: "Validation failed", errors });
  });

  it("ignores a malformed errors field", () => {
    const error = new HttpError(400, "Bad request", { errors: "nope" });
    expect(toApiError(error)).toEqual({ message: "Bad request", errors: undefined });
  });

  it("hides details of unexpected errors", () => {
    expect(toApiError(new TypeError("Failed to fetch"))).toEqual({
      message: "An unexpected error occurred",
    });
  });
});
