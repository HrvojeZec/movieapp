import {
  Bookmark,
  CreditCard,
  Eye,
  Flame,
  Heart,
  Home,
  ListVideo,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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

// The mobile drawer also has Home, Favorites, Watchlist, Watched, Lists and For you, which desktop reaches via the logo, the
// heart menu and the account menu
export const DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.home, icon: Home },
  ...PRIMARY_LINKS,
  { label: "Favorites", href: ROUTES.favorites, icon: Heart, requiresAuth: true },
  { label: "Watchlist", href: ROUTES.watchlist, icon: Bookmark, requiresAuth: true },
  { label: "Watched", href: ROUTES.watched, icon: Eye, requiresAuth: true },
  { label: "Lists", href: ROUTES.lists, icon: ListVideo, requiresAuth: true },
  { label: "For you", href: ROUTES.recommendations, icon: Sparkles, requiresAuth: true },
];
