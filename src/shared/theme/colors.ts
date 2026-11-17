// For props that need a literal color (icons render it into SVG attributes, where CSS variables
// don't work). Keep in sync with the custom properties in src/styles/globals.scss.
export const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  rating: "#fbbf24",
  muted: "#9ca3af",
  mutedDark: "#6b7280",
} as const;
