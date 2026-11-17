import dayjs from "dayjs";

const MINUTES_PER_HOUR = 60;
const NOT_AVAILABLE = "N/A";

export const formatYear = (dateString: string): string => {
  if (!dateString) return NOT_AVAILABLE;
  return dayjs(dateString).format("YYYY");
};

/** e.g. "November 17, 2026" */
export const formatDate = (date: string | Date): string => dayjs(date).format("MMMM D, YYYY");

/** "1 favorite", "2 favorites"; pass the plural for irregular words. */
export const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
  count === 1 ? singular : plural;

const SECONDS_PER_MINUTE = 60;

/** A wait in words, rounded up: "45 seconds", "1 minute", "12 minutes". */
export const formatWait = (seconds: number): string => {
  if (seconds < SECONDS_PER_MINUTE) return `${seconds} ${pluralize(seconds, "second")}`;
  const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
  return `${minutes} ${pluralize(minutes, "minute")}`;
};

const ELLIPSIS = "…";

/** Shortens text to at most `maxLength` characters, cutting at a word boundary. */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - ELLIPSIS.length);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}${ELLIPSIS}`;
};

export const formatRuntime = (minutes: number): string => {
  if (!minutes || minutes <= 0) return NOT_AVAILABLE;

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const mins = minutes % MINUTES_PER_HOUR;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
};
