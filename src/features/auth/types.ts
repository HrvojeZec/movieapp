export interface AuthUser {
  id: string;
  email: string;
  name: string;
  favorites: string[];
  watchlist: string[];
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  /** Billing details of the paid subscription; absent on the free plan. Dates are ISO strings. */
  subscription?: {
    interval: "month" | "year";
    currentPeriodEnd: string;
    /** When access ends after a cancellation; null while it renews. */
    cancelAt: string | null;
    trialEnd: string | null;
  };
  createdAt: Date;
  lastLogin?: Date;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}
