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

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}
