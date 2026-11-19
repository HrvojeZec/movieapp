"use client";
import { useEffect, useRef } from "react";
import classes from "./FilmGrain.module.scss";

/**
 * A faint grain over the hero, like film. It flickers in a few steps by moving its texture
 * (transform only) and stops while the hero is off screen; with reduced motion it stays still.
 */
export function FilmGrain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.playing = String(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={classes.grain} data-playing="false" aria-hidden>
      <div className={classes.noise} />
    </div>
  );
}
