"use client";

import { useEffect, useState } from "react";
import type { WorkPayload } from "./work";

/**
 * The baked copy, refreshed from the API in the browser.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE BAKED COPY IS THE FLOOR. THIS CAN ONLY EVER ADD FRESHNESS.
 *
 * `initial` is what `npm run build` fetched and wrote into the HTML. It is
 * what a crawler reads, what renders with JavaScript off, and what a visitor
 * sees while the API is unreachable. This starts from exactly that.
 *
 * Every failure path ends in "keep what we have": a network error, a 500, a
 * timeout, HTML where JSON was expected. None of them blank the page, and
 * none show the visitor an error, because the page is not broken — it is
 * merely not newer.
 *
 * ⚠ AN EMPTY ANSWER IS NOT A FAILURE, AND MUST BE APPLIED. This once bailed
 *   on `work.length === 0` to stop a sick API blanking a good page, and that
 *   broke the direction that matters: publishing is never urgent, WITHDRAWING
 *   is. Charter 04 §V is not a thing to be eventually consistent about. Shape
 *   is what protects the page now — a proxy error or a login redirect does
 *   not arrive as two valid arrays, and a 500 never reaches here at all.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Extracted from LiveWork so /products gets the same behaviour rather than a
 * second copy that drifts. The reasoning above is the expensive part; having
 * it in two files is how one of them quietly stops being true.
 */
export function useLivePayload(
  initial: WorkPayload,
  origin: string,
  path: string,
): WorkPayload {
  const [payload, setPayload] = useState<WorkPayload>(initial);

  useEffect(() => {
    // Abandoned if the visitor navigates away mid-flight — otherwise the
    // response resolves into an unmounted component.
    const abort = new AbortController();

    // A ceiling on how long a stale page waits for a fresher one. An API that
    // accepts connections and then hangs would otherwise hold the request
    // open indefinitely, and the visitor sees the built copy either way.
    const timer = setTimeout(() => abort.abort(), 8000);

    (async () => {
      try {
        const response = await fetch(`${origin}/api/public/${path}`, {
          signal: abort.signal,
          // The browser must not serve this from its own cache — that would
          // reintroduce exactly the staleness this exists to remove, and
          // invisibly, because a cached 200 and a fresh 200 look identical.
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;

        const fresh = (await response.json()) as WorkPayload;
        if (!Array.isArray(fresh.work) || !Array.isArray(fresh.categories)) {
          return;
        }

        // Only re-render when something actually changed, so the common case
        // — nothing published since the last deploy — costs one comparison
        // and no DOM work, and nothing flickers.
        setPayload((current) =>
          JSON.stringify(current) === JSON.stringify(fresh) ? current : fresh,
        );
      } catch {
        // Deliberately silent, including on abort. There is nothing to tell
        // the visitor: they are looking at the page, and it is correct as of
        // the last deploy.
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [origin, path]);

  return payload;
}
