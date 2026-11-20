"use client";
import dynamic from "next/dynamic";
import { COLORS } from "@/shared/theme/colors";
import classes from "./AuthBackground.module.scss";

// WebGL, so it is loaded only on the login and registration pages, and only in the browser
const DarkVeil = dynamic(() => import("@/shared/vendor/react-bits/DarkVeil/DarkVeil"), {
  ssr: false,
});

// Slow and dim: atmosphere behind the form, not something to watch
const VEIL = { speed: 0.3, opacity: 0.55 };

export function AuthBackground() {
  return (
    <div className={classes.background} aria-hidden="true">
      <DarkVeil
        color={COLORS.primary}
        speed={VEIL.speed}
        opacity={VEIL.opacity}
        mouseInteraction={false}
      />
    </div>
  );
}
