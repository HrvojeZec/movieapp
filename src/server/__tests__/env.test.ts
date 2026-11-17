import { describe, expect, it, vi } from "vitest";
import { requireEnv } from "@/server/env";

describe("requireEnv", () => {
  it("returns the value of a set variable", () => {
    vi.stubEnv("TEST_SECRET", "value");
    expect(requireEnv("TEST_SECRET")).toBe("value");
  });

  it.each([undefined, ""])("throws a clear error when the variable is %j", (value) => {
    vi.stubEnv("TEST_SECRET", value);
    expect(() => requireEnv("TEST_SECRET")).toThrow("TEST_SECRET environment variable is required");
  });
});
