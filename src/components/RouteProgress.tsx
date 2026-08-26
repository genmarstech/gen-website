"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingMark } from "./LoadingMark";
import { onRouteProgressStart } from "./routeProgressBus";
import styles from "./RouteProgress.module.css";

/**
 * Navigation loading indicator.
 *
 * ── THE TIMING IS THE WHOLE DESIGN ───────────────────────────────────────────
 * This is a static export with prefetching, so most navigations resolve in a
 * few milliseconds. A loader that appears and vanishes in 30ms is worse than no
 * loader — it reads as a glitch, not as feedback.
 *
 * So two thresholds:
 *   SHOW_DELAY   Nothing appears for the first 140ms. Fast navigations — the
 *                overwhelming majority — show nothing at all.
 *   MIN_VISIBLE  Once it has appeared, it stays for at least 420ms. A loader
 *                that flashes off the instant it arrives is the same glitch in
 *                the other direction.
 *
 * The indicator therefore only shows up when something is genuinely slow: a cold
 * chunk on a poor connection, which is exactly the case it exists for.
 *
 * ── WHY CLICK INTERCEPTION ───────────────────────────────────────────────────
 * The App Router exposes no global navigation-event API. `useLinkStatus` covers
 * a single Link, not the whole document. Intercepting link clicks and watching
 * `usePathname()` for the resolution is the standard approach and works under
 * static export, where there is no server round-trip to hook into.
 */

const SHOW_DELAY = 140;
const MIN_VISIBLE = 420;
/** If a navigation somehow never resolves, do not leave a loader on screen. */
const SAFETY_TIMEOUT = 8000;

export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const shownAt = useRef<number>(0);

  const clearTimers = useCallback(() => {
    for (const timer of [showTimer, hideTimer, safetyTimer]) {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (safetyTimer.current !== null) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }

    setVisible((wasVisible) => {
      if (!wasVisible) return false;

      // Already on screen — honour the minimum so it does not flash off.
      const elapsed = Date.now() - shownAt.current;
      const remaining = Math.max(0, MIN_VISIBLE - elapsed);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setVisible(false);
        hideTimer.current = null;
      }, remaining);

      return true;
    });
  }, []);

  const start = useCallback(() => {
    clearTimers();
    showTimer.current = window.setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(true);
      showTimer.current = null;
    }, SHOW_DELAY);

    safetyTimer.current = window.setTimeout(() => {
      clearTimers();
      setVisible(false);
    }, SAFETY_TIMEOUT);
  }, [clearTimers]);

  /** The navigation has landed. */
  useEffect(() => {
    stop();
    // Intentionally keyed on pathname only: a resolved route is the signal.
  }, [pathname, stop]);

  /** Programmatic navigations (router.push from the command palette). */
  useEffect(() => onRouteProgressStart(start), [start]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Let the browser handle anything that is not a plain left click.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Downloads, new tabs, and anything explicitly opted out.
      if (
        anchor.hasAttribute("download") ||
        (anchor.getAttribute("target") ?? "") === "_blank" ||
        anchor.dataset.noProgress !== undefined
      ) {
        return;
      }

      // mailto:, tel:, and other non-http schemes never navigate the document.
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;

      // External origins are a full page load — the browser shows its own chrome.
      if (url.origin !== window.location.origin) return;

      // Same page, or a pure hash jump: no navigation will resolve, so starting
      // here would leave the indicator hanging until the safety timeout.
      const samePath = url.pathname === window.location.pathname;
      if (samePath && (url.hash || url.search === window.location.search)) {
        return;
      }

      start();
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, [start, clearTimers]);

  return (
    <div
      className={`${styles.root} ${visible ? styles.on : ""}`}
      aria-hidden={!visible}
      data-no-print
    >
      <div className={styles.bar} />
      <div className={styles.badge}>
        <LoadingMark size={22} label={visible ? "Loading page" : null} />
      </div>
    </div>
  );
}
