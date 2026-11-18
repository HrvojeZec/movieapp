export const SIDEBAR_STORAGE_KEY = "movieapp:sidebar";
export type SidebarMode = "expanded" | "collapsed";
/** Without a saved choice, screens at least this wide start with the wide sidebar. */
export const SIDEBAR_EXPANDED_MIN_WIDTH = 1440;

/**
 * Runs in <head> before the first paint, so a collapsed sidebar never flashes wide. It only sets
 * `data-sidebar` on <html>; CSS does the rest. Storage can throw (private mode, blocked site
 * data), so the screen width decides then. A cookie would make every page dynamic.
 */
export const SIDEBAR_INIT_SCRIPT = `(function () {
  var fallback = window.innerWidth >= ${SIDEBAR_EXPANDED_MIN_WIDTH} ? "expanded" : "collapsed";
  var mode = fallback;
  try {
    var saved = window.localStorage.getItem(${JSON.stringify(SIDEBAR_STORAGE_KEY)});
    if (saved === "expanded" || saved === "collapsed") mode = saved;
  } catch (error) {}
  document.documentElement.dataset.sidebar = mode;
})();`;
