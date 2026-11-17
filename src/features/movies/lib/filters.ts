/** A numeric URL parameter, or undefined when it's missing, empty or not a number. */
export function parseNumberParam(value: string | null): number | undefined {
  // Number("") is 0, so `?year=` would otherwise filter by year 0
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Select options for the most recent `count` years, newest first. */
export function buildYearOptions(currentYear: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const year = String(currentYear - i);
    return { value: year, label: year };
  });
}
