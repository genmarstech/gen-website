"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useLivePayload } from "@/lib/useLivePayload";
import { byCategory, type WorkItem, type WorkPayload } from "@/lib/work";
import styles from "./page.module.css";

/**
 * The work, as built — then refreshed from the API in the browser.
 *
 * The build-then-refresh reasoning lives in lib/useLivePayload.ts, which both
 * this and /products use. It is there rather than here because having it in
 * two files is how one of them quietly stops being true.
 *
 * ── CARDS, NOT A LIST OF ESSAYS ───────────────────────────────────────────
 *
 * This was full-width entries separated by rules, each carrying summary,
 * detail, architecture, engineering and results. That reads as a case study
 * per item, which was right when there were three of them and wrong now that
 * this is where daily work gets posted — a reader scanning what we have been
 * doing lately should not have to scroll past four paragraphs per entry.
 *
 * So: a card each, with the one line that says what it is. The longer fields
 * are still served by the API and still shown on the products page, where
 * somebody IS asking for depth.
 */
export function LiveWork({
  initial,
  origin,
}: {
  initial: WorkPayload;
  origin: string;
}) {
  const payload = useLivePayload(initial, origin, "work");

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
            <ul className={styles.grid}>
              {group.items.map((item, i) => (
                <Entry key={item.slug} item={item} index={i} />
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}

/**
 * One piece of work, as a card.
 *
 * The label is rendered, which it was not before. `WorkLabel` existed so a
 * concept could not be written up in the language of a delivered system, and
 * then nothing printed it — the safeguard was in the type and not on the page.
 * On a card it is the first thing read, which is where it belongs: "concept"
 * and "in production" look identical in a summary sentence.
 *
 * Deliberately short. Summary only, no detail or architecture — those are for
 * somebody who has asked, and on a page of daily output nobody has yet.
 */
function Entry({ item, index }: { item: WorkItem; index: number }) {
  const domain = item.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const meta = [item.sector, item.year].filter(Boolean).join(" · ");

  const inner = (
    <>
      <span className={styles.cardLabel}>{item.label_display}</span>
      <h3 className={styles.cardName}>{item.name}</h3>
      {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
      <p className={styles.cardSummary}>{item.summary}</p>
      {domain ? (
        <span className={styles.cardLink}>
          {domain}
          <svg
            width="12"
            height="12"
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
        </span>
      ) : null}
    </>
  );

  /*
   * The whole card is the link when there is somewhere to go, and a plain
   * article when there is not — a research note often has no public URL.
   *
   * One anchor wrapping everything rather than a link at the bottom: a card
   * with a small link in the corner invites a click on the card that does
   * nothing, which reads as broken rather than as "not clickable".
   */
  return (
    <Reveal as="li" delay={index * 60} className={styles.cardWrap}>
      {domain ? (
        <a
          className={styles.card}
          href={item.url}
          rel="noreferrer noopener"
          target="_blank"
        >
          {inner}
          <span className="visually-hidden">(opens in a new tab)</span>
        </a>
      ) : (
        <article className={styles.card}>{inner}</article>
      )}
    </Reveal>
  );
}
