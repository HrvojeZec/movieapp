import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { SubscriptionPlan } from "@/lib/payments/plans";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },
  USER: {
    PROFILE: "/api/user/profile",
    FAVORITES: "/api/user/favorites",
    WATCHLIST: "/api/user/watchlist",
    ACTIVITY: "/api/user/activity",
  },
} as const;

export interface PlanFeature {
  label: string;
  comingSoon?: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  popular?: boolean;
  features: PlanFeature[];
}

// Display data only: Stripe price IDs are resolved on the server (src/lib/payments/plans.ts).
export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    features: [
      { label: "Browse and search movies" },
      { label: "Filter by year, genre and rating" },
      { label: "Watch trailers" },
      { label: "Save favorites" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    popular: true,
    features: [
      { label: "Everything in Basic" },
      { label: "Watchlist", comingSoon: true },
      { label: "Custom movie lists", comingSoon: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    features: [
      { label: "Everything in Premium" },
      { label: "Personalized recommendations", comingSoon: true },
      { label: "Viewing statistics", comingSoon: true },
    ],
  },
];

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
