// Our API endpoints (src/app/api) in one place; the client never builds these paths by hand
const API = "/api";
const AUTH = `${API}/auth`;
const USER = `${API}/user`;
const MOVIES = `${API}/movies`;
const STRIPE = `${API}/stripe`;
const SUBSCRIPTION = `${API}/subscription`;
const LISTS = `${API}/lists`;

export const API_ROUTES = {
  auth: {
    login: `${AUTH}/login`,
    register: `${AUTH}/register`,
    forgotPassword: `${AUTH}/forgot-password`,
    resetPassword: `${AUTH}/reset-password`,
    logout: `${AUTH}/logout`,
  },
  user: {
    profile: `${USER}/profile`,
    favorites: `${USER}/favorites`,
    favorite: (movieId: string) => `${USER}/favorites/${movieId}`,
    watchlist: `${USER}/watchlist`,
    watchlistItem: (movieId: string) => `${USER}/watchlist/${movieId}`,
    watched: `${USER}/watched`,
    watchedIds: `${USER}/watched/ids`,
    watchedItem: (movieId: string) => `${USER}/watched/${movieId}`,
    movieView: `${USER}/activity/view`,
    stats: `${USER}/stats`,
  },
  movies: {
    list: MOVIES,
    search: `${MOVIES}/search`,
    discover: `${MOVIES}/discover`,
    advancedDiscover: `${MOVIES}/discover/advanced`,
    details: (movieId: number) => `${MOVIES}/${movieId}`,
    videos: (movieId: number) => `${MOVIES}/${movieId}/videos`,
  },
  lists: {
    all: LISTS,
    item: (listId: string) => `${LISTS}/${listId}`,
    movies: (listId: string) => `${LISTS}/${listId}/movies`,
    movie: (listId: string, movieId: string) => `${LISTS}/${listId}/movies/${movieId}`,
  },
  recommendations: `${API}/recommendations`,
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
