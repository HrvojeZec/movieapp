import { describe, expect, it } from "vitest";
import { isClientError } from "@/shared/lib/http-status";

describe("isClientError", () => {
  it.each([400, 401, 404, 409, 429, 499])("treats %i as a client error", (status) => {
    expect(isClientError(status)).toBe(true);
  });

  it.each([200, 302, 399, 500, 502, 503])("does not treat %i as a client error", (status) => {
    expect(isClientError(status)).toBe(false);
  });
});
