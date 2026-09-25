"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { WorkImage } from "@/components/WorkImage";
import { useLivePayload } from "@/lib/useLivePayload";
import type { WorkItem, WorkPayload } from "@/lib/work";
import styles from "./page.module.css";

/**
 * What Genmars sells, as feature panels.
 *
 * ── WHY A PANEL AND NOT A CARD IN A GRID ───────────────────────────────────
 *
 * There is one product today and there will not be many. A grid of one reads
 * as a page waiting for content; a panel reads as a thing being presented. It
 * also leaves room for the screenshot each product will eventually carry,
 * which a compact card would not.
 *
 * /work is the opposite case — many small items — and is a grid for exactly
 * that reason. Same data shape, different question being answered.
 */
export function LiveProducts({
  initial,
  origin,
}: {
  initial: WorkPayload;
  origin: string;
}) {
  const payload = useLivePayload(initial, origin, "products");

  if (payload.work.length === 0) {
    return (
      <section className="section">
        <div className="wrap">
          <Reveal className={styles.holding}>
            {/* One line, not an explanation. Somebody here wants to know what
                we sell; if the answer is "nothing yet", that is the answer. */}
            <h2 className={styles.holdingTitle}>Nothing listed here yet.</h2>
            <p className={styles.holdingBody}>
              We build for clients while our own products are in the works.
            </p>
            <div className={styles.holdingActions}>
              <Link href="/work/" className="btn">
                See what we have built
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className={styles.panels}>
          {payload.work.map((item, i) => (
            <Panel key={item.slug} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Panel({ item, index }: { item: WorkItem; index: number }) {
  const domain = item.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Reveal as="article" delay={index * 90} className={styles.panel}>
      {/* Above the name, because on a product page the picture is doing the
          work of a screenshot — it says what kind of thing this is before
          anybody reads a word. Renders nothing without a credit. */}
      <WorkImage
        url={item.image_url}
        alt={item.image_alt}
        creditName={item.image_credit_name}
        creditUrl={item.image_credit_url}
        className={styles.panelImage}
      />

      <div className={styles.panelHead}>
        <h2 className={styles.panelName}>{item.name}</h2>
        <p className={styles.panelKind}>
          {item.category_display}
          {item.sector ? ` · ${item.sector}` : ""}
          {item.year ? ` · ${item.year}` : ""}
        </p>
      </div>

      <p className={styles.panelSummary}>{item.summary}</p>

      {item.detail ? <p className={styles.panelDetail}>{item.detail}</p> : null}

      {/* Chips, not a bulleted list. Someone scanning a product page is
          answering "does it do the thing I need", which is a lookup rather
          than a read. */}
      {item.capabilities.length > 0 ? (
        <ul className={styles.chips}>
          {item.capabilities.map((cap) => (
            <li key={cap} className={styles.chip}>
              {cap}
            </li>
          ))}
        </ul>
      ) : null}

      {item.architecture ? (
        <details className={styles.more}>
          <summary className={styles.moreSummary}>How it is built</summary>
          <p className={styles.panelDetail}>{item.architecture}</p>
          {item.engineering ? (
            <p className={styles.panelDetail}>{item.engineering}</p>
          ) : null}
        </details>
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
    </Reveal>
  );
}
