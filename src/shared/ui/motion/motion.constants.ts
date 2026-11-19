// One motion vocabulary for the whole app, so every reveal and stagger feels the same

/** Seconds a reveal takes. */
export const REVEAL_DURATION = 0.5;
/** Pixels a revealed element rises while it fades in. */
export const REVEAL_OFFSET = 24;
/** Seconds between items of a staggered list. */
export const STAGGER_STEP = 0.06;
/** Items in one staggered wave; later items reuse the delays, so long lists don't lag. */
export const STAGGER_WAVE = 6;
/** Start revealing a little before the element enters the viewport. */
export const REVEAL_VIEWPORT_MARGIN = "0px 0px -60px 0px";

// Ease-out quart: quick start, soft landing
export const EASE_OUT = [0.25, 1, 0.5, 1] as const;

/**
 * Springs for everything that moves in response to the user or to data:
 * snappy settles fast without overshoot, gentle glides into place, bouncy visibly overshoots.
 */
export const SPRINGS = {
  snappy: { type: "spring", stiffness: 500, damping: 40 },
  gentle: { type: "spring", stiffness: 220, damping: 28 },
  bouncy: { type: "spring", stiffness: 400, damping: 15 },
  // A dropped widget settles into its cell with a small overshoot
  land: { type: "spring", stiffness: 380, damping: 24 },
} as const;

/** Pixels an icon shifts on hover. */
export const HOVER_NUDGE_PX = 2;
/** Furthest a magnetic element leans towards the pointer, in pixels. */
export const MAGNET_MAX_PX = 6;

// Saving to the watchlist: the bookmark drops in and swings from its top, the swing dying down
export const BOOKMARK_DROP_PX = 8;
export const BOOKMARK_SWING_DEGREES = [0, -14, 10, -6, 3, 0];
export const BOOKMARK_SWING_SECONDS = 0.6;
// Marking as watched: the eye shuts for a moment
export const BLINK_SCALE = [1, 0.1, 1];
export const BLINK_SECONDS = 0.3;
// Added things pop from this scale on the bouncy spring
export const POP_FROM_SCALE = 0.6;

// A dashboard widget being dragged: lifted a little, leaning into the direction it moves
export const LIFT_SCALE = 1.03;
export const DRAG_TILT_MAX_DEG = 3;
/** Degrees of lean per pixel per second of sideways speed (1000 px/s leans the full 3°). */
export const DRAG_TILT_PER_VELOCITY = 0.003;
