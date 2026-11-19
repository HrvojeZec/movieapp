export interface HighlightPart {
  text: string;
  match: boolean;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits text into the parts that match the query (any case, every occurrence) and the rest. */
export function highlightMatch(text: string, query: string): HighlightPart[] {
  const needle = query.trim();
  if (!needle) return [{ text, match: false }];
  // A capture group keeps the matched parts in the split result, in their original case
  return text
    .split(new RegExp(`(${escapeRegExp(needle)})`, "gi"))
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === needle.toLowerCase() }));
}
