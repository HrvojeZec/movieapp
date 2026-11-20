/** Whether two lists of IDs hold exactly the same IDs, in any order (duplicates don't count). */
export function sameMembers(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const remaining = new Set(b);
  if (remaining.size !== b.length) return false;
  return a.every((id) => remaining.delete(id));
}
