import dayjs from "dayjs";

const MINUTES_PER_HOUR = 60;
const NOT_AVAILABLE = "N/A";

export const formatYear = (dateString: string): string => {
  if (!dateString) return NOT_AVAILABLE;
  return dayjs(dateString).format("YYYY");
};

/** e.g. "November 17, 2026" */
export const formatDate = (date: string | Date): string => dayjs(date).format("MMMM D, YYYY");

export const formatRuntime = (minutes: number): string => {
  if (!minutes || minutes <= 0) return NOT_AVAILABLE;

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const mins = minutes % MINUTES_PER_HOUR;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
};
