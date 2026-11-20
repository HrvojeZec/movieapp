// Dependency audit for CI: `npm audit`, but an advisory with no patched release yet can be accepted
// for a limited time instead of blocking every pull request. Usage: node scripts/audit.mjs [--omit=dev]
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/**
 * Advisories we knowingly accept until `expires` (inclusive). Each needs a reason why it doesn't
 * affect this app; after the date the audit fails again so the entry is revisited, not forgotten.
 */
export const ACCEPTED_ADVISORIES = [
  {
    id: "GHSA-fc5q-39xc-vjpf",
    package: "picomatch",
    expires: "2026-12-31",
    reason:
      "ReDoS via crafted glob patterns; no patched release exists. Globs come only from tool " +
      "configuration (sass watcher, test runner, linters), never from user input.",
  },
];

const BLOCKING_SEVERITIES = new Set(["high", "critical"]);

const advisoryId = (advisory) =>
  advisory.url?.split("/").pop() || `npm-advisory-${advisory.source}`;

const isExpired = (entry, today) => new Date(`${entry.expires}T23:59:59Z`) < today;

/**
 * Splits the high and critical advisories in an `npm audit --json` report into blocking and
 * accepted ones. Packages that are vulnerable only through a dependency (`via` is a package name)
 * add nothing: the advisory itself is listed under the package that has it.
 */
export function evaluateAudit(report, accepted, today) {
  const advisories = new Map();
  for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via !== "object" || !BLOCKING_SEVERITIES.has(via.severity)) continue;
      const id = advisoryId(via);
      if (!advisories.has(id)) {
        advisories.set(id, {
          id,
          package: via.name,
          title: via.title,
          severity: via.severity,
          url: via.url,
        });
      }
    }
  }

  const blocking = [];
  const acceptedFound = [];
  for (const advisory of advisories.values()) {
    const entry = accepted.find((a) => a.id === advisory.id);
    if (!entry) blocking.push(advisory);
    else if (isExpired(entry, today)) blocking.push({ ...advisory, expired: true });
    else acceptedFound.push({ ...advisory, expires: entry.expires, reason: entry.reason });
  }
  return { blocking, accepted: acceptedFound };
}

function runNpmAudit(args) {
  // One command string through the shell: npm is a .cmd script on Windows, and the arguments are
  // ours (CI config), not user input
  const result = spawnSync(["npm", "audit", "--json", ...args].join(" "), {
    encoding: "utf8",
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  try {
    return JSON.parse(result.stdout);
  } catch {
    // Not a report (e.g. the registry is unreachable): fail rather than pass silently
    console.error(result.stderr || result.stdout || "npm audit produced no output");
    process.exit(1);
  }
}

function main() {
  const report = runNpmAudit(process.argv.slice(2));
  const { blocking, accepted } = evaluateAudit(report, ACCEPTED_ADVISORIES, new Date());

  for (const a of accepted) {
    console.log(`Accepted until ${a.expires}: ${a.id} (${a.package}, ${a.severity}) ${a.title}`);
    console.log(`  Reason: ${a.reason}`);
  }
  for (const a of blocking) {
    const note = a.expired ? " [accepted entry expired: fix it or extend with a reason]" : "";
    console.error(`Blocking: ${a.id} (${a.package}, ${a.severity}) ${a.title}${note}`);
    console.error(`  ${a.url}`);
  }

  if (blocking.length > 0) {
    console.error(`\n${blocking.length} high or critical advisory(ies) must be fixed.`);
    process.exit(1);
  }
  console.log(`\nNo blocking advisories (${accepted.length} accepted).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
