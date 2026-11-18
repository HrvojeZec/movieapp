// Our API endpoints (src/app/api) in one place; the client never builds these paths by hand
const API = "/api";
const AUTH = `${API}/auth`;
const USER = `${API}/user`;
const MOVIES = `${API}/movies`;
const STRIPE = `${API}/stripe`;
const SUBSCRIPTION = `${API}/subscription`;

export const API_ROUTES = {
  auth: {
    login: `${AUTH}/login`,
    register: `${AUTH}/register`,
    logout: `${AUTH}/logout`,
  },
  user: {
    profile: `${USER}/profile`,
    favorites: `${USER}/favorites`,
    favorite: (movieId: string) => `${USER}/favorites/${movieId}`,
  },
  movies: {
    list: MOVIES,
    search: `${MOVIES}/search`,
    discover: `${MOVIES}/discover`,
    details: (movieId: number) => `${MOVIES}/${movieId}`,
    videos: (movieId: number) => `${MOVIES}/${movieId}/videos`,
  },
  genres: `${API}/genres`,
  notifications: {
    list: `${API}/notifications`,
    read: `${API}/notifications/read`,
  },
  health: `${API}/health`,
  cron: {
    subscriptionReminders: `${API}/cron/subscription-reminders`,
  },
  subscription: {
    cancel: `${SUBSCRIPTION}/cancel`,
    resume: `${SUBSCRIPTION}/resume`,
    portal: `${SUBSCRIPTION}/portal`,
  },
  stripe: {
    createCheckoutSession: `${STRIPE}/create-checkout-session`,
    checkoutSuccess: `${STRIPE}/checkout-success`,
  },
} as const;
