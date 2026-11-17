// TMDB serves at most 500 pages per list, regardless of total_pages
export const TMDB_MAX_PAGE = 500;

export const DAY = 24 * 60 * 60 * 1000;

// Bounds for user input, so nonsense values never reach TMDB
export const MIN_RELEASE_YEAR = 1870;
export const MAX_RELEASE_YEAR = 2100;
export const MAX_RATING = 10;
export const SEARCH_QUERY_MAX_LENGTH = 100;

// Search-as-you-type: wait for a pause in typing and at least a few characters
export const SEARCH_DEBOUNCE_MS = 400;
export const SEARCH_SUGGESTION_MIN_LENGTH = 3;
export const SEARCH_SUGGESTION_LIMIT = 8;

// Home page
export const HERO_HEIGHT = 600;
export const TOP_RATED_LIMIT = 6;
export const GENRE_ROWS = 10;
// Genre rows start loading this far before they scroll into view
export const GENRE_ROW_PRELOAD_MARGIN = "400px";

// Movie page
export const CAST_LIMIT = 12;

// Most Watched
export const YEAR_OPTIONS_COUNT = 30;
export const INFINITE_SCROLL_MARGIN = "600px";

// Grids and rows
export const GRID_COLUMNS = { base: 2, sm: 3, md: 4, lg: 6 };
export const GRID_SKELETON_COUNT = 12;
export const ROW_SKELETON_COUNT = 8;
export const ROW_CARD_WIDTH = 200;
export const CARD_SKELETON_HEIGHT = 340;
export const MOVIE_CARD_SIZES = {
  sm: { card: 280, image: 180 },
  md: { card: 340, image: 240 },
  lg: { card: 400, image: 300 },
} as const;
