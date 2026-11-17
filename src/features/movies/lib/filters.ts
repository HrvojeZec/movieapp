/** A numeric URL parameter, or undefined when it's missing, empty or not a number. */
export function parseNumberParam(value: string | null): number | undefined {
  // Number("") is 0, so `?year=` would otherwise filter by year 0
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Applies `changes` to a query string: a value sets the parameter, null or "" removes it. Other
 * parameters are kept. Returns the new query without the leading "?".
 */
export function updateQuery(query: string, changes: Record<string, string | null>): string {
  const params = new URLSearchParams(query);
  for (const [name, value] of Object.entries(changes)) {
    if (value) params.set(name, value);
    else params.delete(name);
  }
  return params.toString();
}

/** Select options for the most recent `count` years, newest first. */
export function buildYearOptions(currentYear: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const year = String(currentYear - i);
    return { value: year, label: year };
  });
}
