"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import styles from "./Reveal.module.css";

type RevealProps = {
  children: ReactNode;
  /** Stagger in ms, for revealing a row of items in sequence. */
  delay?: number;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
};

/**
 * Scroll reveal — fade and rise as an element enters the viewport.
 *
 * Uses IntersectionObserver and unobserves after the first reveal: the animation
 * plays once, never on scroll-back, which is the difference between a site that
 * feels considered and one that feels restless.
 *
 * Content is visible by default and the animation only *starts* hidden once JS
 * confirms it can run — so with JavaScript disabled, or if the observer never
 * fires, nothing is ever stuck invisible. Progressive enhancement, not a
 * dependency.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    // Only hide the content once we know the observer is available to show it.
    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const classes = [
    styles.reveal,
    armed ? styles.armed : "",
    shown ? styles.shown : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={classes}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
