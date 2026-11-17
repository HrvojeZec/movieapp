import { ImageResponse } from "next/og";
import { COLORS } from "@/shared/theme/colors";
import { FilmMark } from "./_brand/FilmMark";

// Home screen icon on iPhone and iPad; iOS rounds the corners itself
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.background,
      }}
    >
      <FilmMark size={120} />
    </div>,
    size,
  );
}
