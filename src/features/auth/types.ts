import type { ApiError } from "@/shared/types/api";

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

export interface AuthResult {
  success: boolean;
  error?: ApiError;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, name: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  loading: boolean;
  toggleFavorite: (movieId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}
