import { describe, expect, it } from "vitest";
import { isDigit, toDigitSlots } from "@/shared/lib/rolling-digits";

describe("toDigitSlots", () => {
  it("splits a number into digit slots", () => {
    expect(toDigitSlots(42)).toEqual(["4", "2"]);
    expect(toDigitSlots(0)).toEqual(["0"]);
  });

  it("pads to the minimum digit count", () => {
    expect(toDigitSlots(7, { minDigits: 3 })).toEqual(["0", "0", "7"]);
  });

  it("groups thousands", () => {
    expect(toDigitSlots(1234567)).toEqual(["1", ",", "2", "3", "4", ",", "5", "6", "7"]);
  });

  it("keeps the decimals", () => {
    expect(toDigitSlots(1234.5, { decimals: 2 })).toEqual(["1", ",", "2", "3", "4", ".", "5", "0"]);
    expect(toDigitSlots(9.99, { decimals: 2 })).toEqual(["9", ".", "9", "9"]);
  });

  it("rounds to the requested decimals", () => {
    expect(toDigitSlots(2.6)).toEqual(["3"]);
  });
});

describe("isDigit", () => {
  it("tells digits from separators", () => {
    expect(["7", ",", ".", "-"].map(isDigit)).toEqual([true, false, false, false]);
  });
});
