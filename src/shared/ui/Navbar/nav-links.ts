import { Bookmark, CreditCard, Eye, Flame, Heart, Home, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/shared/routes";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to logged-in users. */
  requiresAuth?: boolean;
}

// Shown inline on desktop
export const PRIMARY_LINKS: NavLink[] = [
  { label: "Most Watched", href: ROUTES.mostWatched, icon: Flame },
  { label: "Pricing", href: ROUTES.pricing, icon: CreditCard },
];

// The mobile drawer also has Home, Favorites, Watchlist and Watched, which desktop reaches via the logo, the
// heart menu and the account menu
export const DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.home, icon: Home },
  ...PRIMARY_LINKS,
  { label: "Favorites", href: ROUTES.favorites, icon: Heart, requiresAuth: true },
  { label: "Watchlist", href: ROUTES.watchlist, icon: Bookmark, requiresAuth: true },
  { label: "Watched", href: ROUTES.watched, icon: Eye, requiresAuth: true },
];
