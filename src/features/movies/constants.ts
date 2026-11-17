// TMDB serves at most 500 pages per list, regardless of total_pages
export const TMDB_MAX_PAGE = 500;

// Bounds for user input, so nonsense values never reach TMDB
export const MIN_RELEASE_YEAR = 1870;
export const MAX_RELEASE_YEAR = 2100;
export const MAX_RATING = 10;
export const SEARCH_QUERY_MAX_LENGTH = 100;

// Shown when TMDB has no poster for a movie
export const PLACEHOLDER_POSTER = "/placeholder-movie.svg";

// Search-as-you-type: wait for a pause in typing and at least a few characters
export const SEARCH_DEBOUNCE_MS = 400;
export const SEARCH_SUGGESTION_MIN_LENGTH = 3;
export const SEARCH_SUGGESTION_LIMIT = 8;

// Home page
// Which TMDB list feeds each home page section; also prefetched on the server
export const HOME_LISTS = {
  hero: "popular",
  nowPlaying: "now_playing",
  topRated: "top_rated",
} as const;
export const HERO_HEIGHT = 600;
export const TOP_RATED_LIMIT = 6;
export const GENRE_ROWS = 10;
// Genre rows start loading this far before they scroll into view
export const GENRE_ROW_PRELOAD_MARGIN = "400px";

// Movie page
export const CAST_LIMIT = 12;
// Search engines show about this many characters of a description
export const META_DESCRIPTION_MAX_LENGTH = 160;
// TMDB posters are 2:3, so the w500 size is 500 x 750
export const OG_POSTER = { size: "w500", width: 500, height: 750 } as const;

// Most Watched: years from next year (upcoming releases) back
export const YEAR_OPTIONS_COUNT = 30;
export const INFINITE_SCROLL_MARGIN = "600px";
export const FILTER_WIDTHS = { year: 150, genre: 200, rating: 150 } as const;

// Grids and rows
export const GRID_COLUMNS = { base: 2, sm: 3, md: 4, lg: 6 };
export const GRID_SKELETON_COUNT = 12;
export const ROW_SKELETON_COUNT = 8;
export const ROW_CARD_WIDTH = 200;
// Poster height per card size; the card grows with its text below
export const MOVIE_CARD_SIZES = {
  sm: { image: 180 },
  md: { image: 240 },
} as const;
// Height of the text block under a poster (padding, two title lines, rating row), so skeletons
// match the cards they stand in for
export const CARD_BODY_HEIGHT = 102;
