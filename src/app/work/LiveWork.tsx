"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { byCategory, type WorkItem, type WorkPayload } from "@/lib/work";
import styles from "./page.module.css";

/**
 * The work, as built — then refreshed from the API in the browser.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE BAKED COPY IS THE FLOOR. THIS CAN ONLY EVER ADD FRESHNESS.
 *
 * `initial` is what `npm run build` fetched and wrote into the HTML. It is
 * what a crawler reads, what renders with JavaScript off, and what a visitor
 * sees while the API is unreachable. This component starts from exactly that
 * and never replaces it with less.
 *
 * Every failure path therefore ends in "keep what we have": a network error,
 * a 500, a timeout, HTML where JSON was expected. None of them blank the
 * page, and none of them show the visitor an error, because the page is not
 * broken — it is merely not newer.
 *
 * ⚠ AN EMPTY ANSWER IS NOT A FAILURE, AND MUST BE APPLIED.
 *
 *   This used to bail on `work.length === 0`, to stop a sick API blanking a
 *   good page. That was the wrong trade, and it broke the direction that
 *   actually matters. Publishing is never urgent; WITHDRAWING is. When a
 *   client takes back permission, permission_on_file goes false, the item
 *   leaves the payload — and under the old guard the site went on printing
 *   their name until somebody happened to deploy. Charter 04 §V is not a
 *   thing to be eventually consistent about.
 *
 *   So the asymmetry is gone: a well-formed 200 saying nothing is published
 *   is the API answering, not the API failing, and the page follows it down
 *   to the holding line. What still protects the page is SHAPE, checked
 *   below — a proxy error, a login redirect and a 500 do not arrive as two
 *   valid arrays, and a 500 never reaches here at all.
 *
 *   The residual risk is real and accepted: a healthy-looking empty payload
 *   served in error shows the holding line until the next fetch succeeds.
 *   That is visible, self-correcting on the next page load, and recoverable.
 *   A withdrawn client left on the internet is none of those three.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── WHY THE FIRST RENDER MUST MATCH THE SERVER EXACTLY ────────────────────
 *
 * State initialises to `initial` and is only ever changed inside an effect,
 * which runs after hydration. Fetching during render, or seeding state from
 * anything the server did not also compute, produces a hydration mismatch —
 * React discards the server HTML and re-renders on the client, which is the
 * one outcome that would cost the properties this design exists to keep.
 */
export function LiveWork({
  initial,
  origin,
}: {
  initial: WorkPayload;
  origin: string;
}) {
  const [payload, setPayload] = useState<WorkPayload>(initial);

  useEffect(() => {
    /*
     * Abandoned if the visitor navigates away mid-flight — otherwise the
     * response resolves into an unmounted component, and in development that
     * is a warning rather than the silent no-op it looks like.
     */
    const abort = new AbortController();

    /*
     * A ceiling on how long a stale page can be waiting for a fresher one.
     * Without it, an API that accepts connections and then hangs leaves the
     * request open indefinitely; the visitor sees the built copy either way,
     * so there is nothing to gain by waiting longer.
     */
    const timer = setTimeout(() => abort.abort(), 8000);

    (async () => {
      try {
        const response = await fetch(`${origin}/api/public/work`, {
          signal: abort.signal,
          /*
           * The browser must not serve this from its own HTTP cache — that
           * would reintroduce exactly the staleness this component exists to
           * remove, and it would be invisible, because a cached 200 and a
           * fresh 200 are the same to the code below.
           */
          cache: "no-store",
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;

        const fresh = (await response.json()) as WorkPayload;

        // Shape first. A proxy error page, a login redirect and a JSON body
        // from the wrong endpoint all parse or throw unhelpfully; none of
        // them have this shape.
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
  }, [origin]);

  const groups = byCategory(payload).filter((g) => g.items.length > 0);

  if (payload.work.length === 0) {
    return (
      <section className="section">
        <div className="wrap">
          <Reveal className={styles.holding}>
            {/*
              One line, not an explanation. Somebody arriving here wants to
              know what we have built; if the answer is "nothing published
              yet", that is the whole answer and the buttons are the useful
              part.
            */}
            <h2 className={styles.holdingTitle}>Nothing is published here yet.</h2>
            <p className={styles.holdingBody}>
              Ask us directly and we will walk you through what we have built.
            </p>
            <div className={styles.holdingActions}>
              <Link href="/services/" className="btn">
                Ask about our work
              </Link>
              <Link href="/approach/" className="btn btn--ghost">
                How we build
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <section className="section" key={group.key}>
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">{group.label}</p>
            </Reveal>
            <div className={styles.list}>
              {group.items.map((item, i) => (
                <Entry key={item.slug} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/**
 * One system.
 *
 * The label is rendered here, which it was not before. `WorkLabel` existed so
 * a concept could not be written up in the language of a delivered system,
 * and then nothing printed it — the safeguard was in the type and not on the
 * page.
 */
function Entry({ item, index }: { item: WorkItem; index: number }) {
  const domain = item.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Reveal as="article" delay={index * 90} className={styles.item}>
      <div className={styles.itemMeta}>
        <span className={styles.itemNum}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {item.sector ? (
          <span className={styles.itemSector}>{item.sector}</span>
        ) : null}
        {item.year ? <span className={styles.itemYear}>{item.year}</span> : null}
      </div>

      <div className={styles.itemBody}>
        <h2 className={styles.itemClient}>{item.name}</h2>
        <hr className="rule--accent" />
        <p className={styles.itemLabel}>{item.label_display}</p>
        <p className={styles.itemSummary}>{item.summary}</p>
        {item.detail ? <p className={styles.itemDetail}>{item.detail}</p> : null}
        {item.architecture ? (
          <p className={styles.itemDetail}>{item.architecture}</p>
        ) : null}
        {item.engineering ? (
          <p className={styles.itemDetail}>{item.engineering}</p>
        ) : null}
        {item.results ? <p className={styles.itemDetail}>{item.results}</p> : null}

        {item.capabilities.length > 0 ? (
          <ul className={styles.caps}>
            {item.capabilities.map((cap) => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
        ) : null}

        {domain ? (
          <a
            href={item.url}
            className={styles.visit}
            rel="noreferrer noopener"
            target="_blank"
          >
            {domain}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </Reveal>
  );
}
