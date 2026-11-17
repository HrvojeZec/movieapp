import { ImageResponse } from "next/og";
import { APP_NAME } from "@/shared/constants";
import { COLORS } from "@/shared/theme/colors";
import { FilmMark } from "./_brand/FilmMark";

// The picture shown when a link to the app is shared (Slack, LinkedIn, WhatsApp, X).
// Movie pages override it with their poster.
export const alt = `${APP_NAME}: discover movies, save favorites, go premium`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deep blue (Tailwind blue-900) glow behind the logo, fading into the page background
const GLOW = "#1e3a8a";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        background: `radial-gradient(circle at 50% 0%, ${GLOW} 0%, ${COLORS.background} 70%)`,
        color: COLORS.text,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <FilmMark size={120} />
        <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -2 }}>{APP_NAME}</div>
      </div>
      <div style={{ fontSize: 40, color: COLORS.muted }}>
        Discover movies, save favorites, go premium
      </div>
    </div>,
    size,
  );
}
