import type { ReactNode } from "react";
import classes from "./template.module.scss";

// Unlike a layout, a template remounts on every navigation, so each page gets the enter animation
export default function Template({ children }: { children: ReactNode }) {
  return <div className={classes.page}>{children}</div>;
}
