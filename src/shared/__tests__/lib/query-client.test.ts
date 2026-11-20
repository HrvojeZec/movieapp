import { describe, expect, it } from "vitest";
import { HttpError } from "@/shared/lib/http";
import { shouldRetry } from "@/shared/lib/query-client";

describe("shouldRetry", () => {
  it.each([400, 401, 404, 429])("does not retry client error %i", (status) => {
    expect(shouldRetry(0, new HttpError(status, "client error"))).toBe(false);
  });

  it("retries server and network errors up to twice", () => {
    const serverError = new HttpError(502, "bad gateway");
    expect(shouldRetry(0, serverError)).toBe(true);
    expect(shouldRetry(1, new TypeError("Failed to fetch"))).toBe(true);
    expect(shouldRetry(2, serverError)).toBe(false);
  });
});
