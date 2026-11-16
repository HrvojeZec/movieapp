import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const formatYear = (dateString: string): string => {
  if (!dateString) return "N/A";
  return dayjs(dateString).format("YYYY");
};

export const formatDateDisplay = {
  short: (date: string | Date) => dayjs(date).format("MMM D, YYYY"),
  long: (date: string | Date) => dayjs(date).format("MMMM D, YYYY"),
  full: (date: string | Date) => dayjs(date).format("dddd, MMMM D, YYYY"),
  time: (date: string | Date) => dayjs(date).format("h:mm A"),
  dateTime: (date: string | Date) => dayjs(date).format("MMM D, YYYY h:mm A"),
  iso: (date: string | Date) => dayjs(date).toISOString(),
  relative: (date: string | Date) => dayjs(date).fromNow(),
};

export const formatRuntime = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "N/A";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
};
