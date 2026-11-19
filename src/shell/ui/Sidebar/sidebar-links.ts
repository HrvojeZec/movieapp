import {
  BarChart3,
  Bookmark,
  CreditCard,
  Eye,
  Flame,
  Heart,
  Home,
  ListVideo,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/entities/user/types";
import { getPlanName, hasFeature, requiredPlanFor } from "@/entities/subscription/lib/entitlements";
import type { Feature, SubscriptionPlan } from "@/entities/subscription/types";
import { ROUTES } from "@/shared/routes";

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Plans without it see the link with a lock; the page itself shows the upgrade. */
  feature?: Feature;
  /** Shows a count next to the icon. */
  badge?: "favorites";
  /** Opens the search palette instead of navigating (the href is the fallback page). */
  opensSearch?: boolean;
}

export interface SidebarGroup {
  label: string;
  links: SidebarLink[];
  /** Only for signed-in users. */
  requiresAuth?: boolean;
}

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "Browse",
    links: [
      { label: "Home", href: ROUTES.home, icon: Home },
      { label: "Most Watched", href: ROUTES.mostWatched, icon: Flame },
      { label: "Search", href: ROUTES.search(), icon: Search, opensSearch: true },
      { label: "Pricing", href: ROUTES.pricing, icon: CreditCard },
    ],
  },
  {
    label: "Library",
    requiresAuth: true,
    links: [
      { label: "Favorites", href: ROUTES.favorites, icon: Heart, badge: "favorites" },
      { label: "Watchlist", href: ROUTES.watchlist, icon: Bookmark, feature: "watchlist" },
      { label: "Watched", href: ROUTES.watched, icon: Eye },
      { label: "Lists", href: ROUTES.lists, icon: ListVideo, feature: "customLists" },
    ],
  },
  {
    label: "For you",
    requiresAuth: true,
    links: [
      {
        label: "Recommendations",
        href: ROUTES.recommendations,
        icon: Sparkles,
        feature: "recommendations",
      },
      { label: "Stats", href: ROUTES.stats, icon: BarChart3, feature: "stats" },
    ],
  },
];

/** Visitors see what they can browse; the library and personal pages need an account. */
export const visibleGroups = (user: AuthUser | null): SidebarGroup[] =>
  SIDEBAR_GROUPS.filter((group) => !group.requiresAuth || user);

/** The plan a link needs when the user's plan doesn't include it, e.g. "Premium". */
export const lockedPlanName = (link: SidebarLink, plan: SubscriptionPlan): string | null =>
  link.feature && !hasFeature(plan, link.feature)
    ? getPlanName(requiredPlanFor(link.feature))
    : null;
