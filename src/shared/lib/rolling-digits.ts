interface DigitSlotOptions {
  decimals?: number;
  /** Leading zeros up to this many integer digits. */
  minDigits?: number;
}

/** The characters a rolling number shows: digits roll, separators stay put. */
export function toDigitSlots(value: number, options: DigitSlotOptions = {}): string[] {
  const { decimals = 0, minDigits = 1 } = options;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    minimumIntegerDigits: minDigits,
  }).format(value);
  return [...formatted];
}

export const isDigit = (slot: string): boolean => slot >= "0" && slot <= "9" && slot.length === 1;
