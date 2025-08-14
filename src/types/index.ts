export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  production_countries: { iso_3166_1: string; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

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

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
}

export interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
}

export interface HorizontalMovieScrollProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
}

export interface TrailerModalProps {
  opened: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

export interface AuthFormProps {
  type: "login" | "register";
}

export interface SearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
}

export interface FavoriteMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export interface MovieFilters {
  year?: number;
  genre?: number;
  minRating?: number;
  page?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationSchema<T> = {
  parse: (data: unknown) => T;
  safeParse: (data: unknown) => { success: boolean; data?: T; error?: any };
};

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  favorites: string[];
  watchlist: string[];
  preferences: {
    genres: string[];
    language: string;
  };
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IReview {
  _id: string;
  userId: string;
  movieId: string;
  rating: number;
  review?: string;
  helpful: number;
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserActivity {
  _id: string;
  userId: string;
  action:
    | "view"
    | "favorite"
    | "unfavorite"
    | "watchlist_add"
    | "watchlist_remove"
    | "review"
    | "search";
  movieId?: string;
  searchQuery?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: any }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
  loading: boolean;
  updateFavorites: (
    favorites: string[],
    movieId?: string,
    action?: "add" | "remove"
  ) => void;

  refreshUser: () => Promise<void>;
}
