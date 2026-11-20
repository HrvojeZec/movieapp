import { describe, expect, it } from "vitest";
import { getClientIp } from "@/server/http/client-ip";

const request = (headers: Record<string, string>) =>
  new Request("http://localhost/api/test", { headers });

describe("getClientIp", () => {
  it("takes the client from x-forwarded-for, not the proxies after it", () => {
    expect(getClientIp(request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(request({ "x-real-ip": "203.0.113.8" }))).toBe("203.0.113.8");
  });

  it("groups requests without an address under one key", () => {
    expect(getClientIp(request({}))).toBe("unknown");
  });
});
