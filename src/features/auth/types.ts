export interface AuthUser {
  id: string;
  email: string;
  name: string;
  favorites: string[];
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  createdAt: Date;
  lastLogin?: Date;
}
