// Durations, so code reads `5 * MINUTE_MS` instead of `5 * 60 * 1000`
export const SECOND_MS = 1000;

export const MINUTE_IN_SECONDS = 60;
export const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;

export const MINUTE_MS = MINUTE_IN_SECONDS * SECOND_MS;
export const DAY_MS = DAY_IN_SECONDS * SECOND_MS;
