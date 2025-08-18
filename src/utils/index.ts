import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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

export const STRIPE_CONFIG = {
  PLANS: {
    BASIC: {
      name: "Basic",
      price: 0,
      priceId: null,
      features: [
        "Browse movies",
        "Add to favorites",
        "Basic search",
        "Mobile access",
      ],
    },
    PREMIUM: {
      name: "Premium",
      price: 9.99,
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
      paymentLink:
        "https://buy.stripe.com/test_14AbJ0dDL6XH23MeXR3cc00?prefilled_email={USER_EMAIL}",
      features: [
        "Everything in Basic",
        "Advanced filters",
        "Unlimited watchlist",
        "HD trailers",
        "Priority support",
        "No ads",
      ],
    },
    PRO: {
      name: "Pro",
      price: 19.99,
      priceId: process.env.STRIPE_PRO_PRICE_ID,
      paymentLink:
        "https://buy.stripe.com/test_8x27sK9nvbdX5fY1713cc01?prefilled_email={USER_EMAIL}",
      features: [
        "Everything in Premium",
        "Movie recommendations",
        "Advanced analytics",
        "Early access to features",
        "Custom movie lists",
        "API access",
      ],
    },
  },
} as const;

export type PlanType = keyof typeof STRIPE_CONFIG.PLANS;

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
