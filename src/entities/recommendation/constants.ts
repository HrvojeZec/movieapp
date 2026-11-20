// How much each kind of signal says about taste: a favorite more than a watched movie, and that
// more than a movie merely saved for later
export const SIGNAL_WEIGHTS = { favorite: 3, watched: 2, watchlist: 1 } as const;
// A signal counts half as much after this many days, so taste can change over time
export const SIGNAL_HALF_LIFE_DAYS = 90;

// Score = seeds + genre match + rating; the parts add up to 1
export const SCORE_WEIGHTS = { seeds: 0.5, genreMatch: 0.35, rating: 0.15 } as const;
// Beyond this many recommending seeds a movie can't score higher
export const MAX_COUNTED_SEEDS = 3;

export const RECOMMENDATION_LIMIT = 20;

// Server: how much history to read, which bounds the TMDB calls per request
export const SEEDS_PER_SOURCE = 5;
export const MAX_SIGNALS_PER_SOURCE = 30;
export const TOP_GENRES_FOR_DISCOVER = 2;
export const GENRE_DISCOVER_MIN_VOTES = 500;

export const COLD_START_REASON = "Popular right now";
export const FALLBACK_REASON = "Highly rated";

// Results change only when the user's favorites, watched movies or watchlist do
export const RECOMMENDATIONS_STALE_MINUTES = 10;
// Cards in the home page row
export const RECOMMENDATIONS_ROW_LIMIT = 12;
