// Every client-side path in one place, so a renamed route is a one-line change
export const ROUTES = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  favorites: "/favorites",
  profile: "/profile",
  pricing: "/subscription/pricing",
  mostWatched: "/most-watched",
  search: (query?: string) => (query ? `/search?q=${encodeURIComponent(query)}` : "/search"),
  movie: (id: number | string) => `/movie/${id}`,
} as const;
