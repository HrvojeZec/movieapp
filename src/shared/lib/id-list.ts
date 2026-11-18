/** A list of IDs with one added (moved to the end) or removed; the original isn't changed. */
export function toggleId(ids: string[], id: string, add: boolean): string[] {
  const without = ids.filter((existing) => existing !== id);
  return add ? [...without, id] : without;
}
