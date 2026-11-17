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
