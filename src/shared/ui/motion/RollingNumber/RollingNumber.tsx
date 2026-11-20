"use client";
import { VisuallyHidden } from "@mantine/core";
import { motion } from "motion/react";
import { isDigit, toDigitSlots } from "@/shared/lib/rolling-digits";
import { SPRINGS } from "../motion.constants";
import classes from "./RollingNumber.module.scss";

// The column stacks the digits 0–9, so each digit is a tenth of its height
const DIGIT_SHARE_PERCENT = 10;

interface RollingNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  minDigits?: number;
  /** Roll up from zero when first shown; off where the final value must show without JS. */
  rollIn?: boolean;
  className?: string;
}

/**
 * A number whose digits roll like an odometer when it changes. Screen readers and text
 * queries get the plain value; the rolling digits are drawn with CSS generated content, so
 * they never leak into the text.
 */
export function RollingNumber({
  value,
  prefix = "",
  suffix = "",
  decimals,
  minDigits,
  rollIn = true,
  className,
}: RollingNumberProps) {
  const slots = toDigitSlots(value, { decimals, minDigits });
  const text = `${prefix}${slots.join("")}${suffix}`;

  return (
    <span className={className ? `${classes.root} ${className}` : classes.root}>
      <VisuallyHidden component="span">{text}</VisuallyHidden>
      <span aria-hidden className={classes.digits}>
        {prefix && <span className={classes.static} data-char={prefix} />}
        {slots.map((slot, index) => {
          // Keyed by place value, so the ones column stays the ones column when 9 becomes 10
          const place = slots.length - index;
          return isDigit(slot) ? (
            <span key={place} className={classes.slot} data-digit={slot}>
              <motion.span
                className={classes.column}
                initial={rollIn ? { y: "0%" } : false}
                animate={{ y: `${-Number(slot) * DIGIT_SHARE_PERCENT}%` }}
                transition={SPRINGS.gentle}
              />
            </span>
          ) : (
            <span key={place} className={classes.static} data-char={slot} />
          );
        })}
        {suffix && <span className={classes.static} data-char={suffix} />}
      </span>
    </span>
  );
}
