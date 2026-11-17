import { describe, expect, it } from "vitest";
import { evaluateAudit } from "../audit.mjs";

const picomatch = {
  source: 1,
  name: "picomatch",
  title: "picomatch vulnerable to ReDoS",
  url: "https://github.com/advisories/GHSA-fc5q-39xc-vjpf",
  severity: "high",
  range: "<=4.0.7",
};

const report = (vulnerabilities: Record<string, unknown>) => ({ vulnerabilities });

const accepted = [
  {
    id: "GHSA-fc5q-39xc-vjpf",
    package: "picomatch",
    expires: "2026-12-31",
    reason: "No patched version",
  },
];

const today = new Date("2026-11-17T12:00:00Z");

describe("evaluateAudit", () => {
  it("passes when there are no vulnerabilities", () => {
    const result = evaluateAudit(report({}), accepted, today);
    expect(result.blocking).toEqual([]);
    expect(result.accepted).toEqual([]);
  });

  it("blocks a high advisory that isn't on the accepted list", () => {
    const result = evaluateAudit(
      report({ picomatch: { severity: "high", via: [picomatch] } }),
      [],
      today,
    );
    expect(result.blocking).toEqual([
      expect.objectContaining({ id: "GHSA-fc5q-39xc-vjpf", package: "picomatch" }),
    ]);
  });

  it("accepts a listed advisory and the packages that only depend on it", () => {
    const result = evaluateAudit(
      report({
        picomatch: { severity: "high", via: [picomatch] },
        micromatch: { severity: "high", via: ["picomatch"] },
      }),
      accepted,
      today,
    );
    expect(result.blocking).toEqual([]);
    expect(result.accepted.map((a) => a.id)).toEqual(["GHSA-fc5q-39xc-vjpf"]);
  });

  it("blocks a listed advisory after its expiry date", () => {
    const result = evaluateAudit(
      report({ picomatch: { severity: "high", via: [picomatch] } }),
      accepted,
      new Date("2027-01-01T00:00:00Z"),
    );
    expect(result.blocking).toEqual([
      expect.objectContaining({ id: "GHSA-fc5q-39xc-vjpf", expired: true }),
    ]);
  });

  it("still blocks other high or critical advisories next to an accepted one", () => {
    const other = {
      ...picomatch,
      name: "next",
      url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
      severity: "critical",
    };
    const result = evaluateAudit(
      report({
        picomatch: { severity: "high", via: [picomatch] },
        next: { severity: "critical", via: [other] },
      }),
      accepted,
      today,
    );
    expect(result.blocking.map((a) => a.id)).toEqual(["GHSA-aaaa-bbbb-cccc"]);
  });

  it("ignores low and moderate advisories", () => {
    const result = evaluateAudit(
      report({ qs: { severity: "moderate", via: [{ ...picomatch, severity: "moderate" }] } }),
      [],
      today,
    );
    expect(result.blocking).toEqual([]);
  });

  it("counts an advisory once even when several packages list it", () => {
    const result = evaluateAudit(
      report({
        picomatch: { severity: "high", via: [picomatch] },
        "tinyglobby/node_modules/picomatch": { severity: "high", via: [picomatch] },
      }),
      [],
      today,
    );
    expect(result.blocking).toHaveLength(1);
  });
});
