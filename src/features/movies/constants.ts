// TMDB serves at most 500 pages per list, regardless of total_pages
export const TMDB_MAX_PAGE = 500;

export const DAY = 24 * 60 * 60 * 1000;

// Bounds for user input, so nonsense values never reach TMDB
export const MIN_RELEASE_YEAR = 1870;
export const MAX_RELEASE_YEAR = 2100;
export const MAX_RATING = 10;
export const SEARCH_QUERY_MAX_LENGTH = 100;
