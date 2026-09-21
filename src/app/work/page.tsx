import type { Metadata } from "next";
import Link from "next/link";
import {
  clientWork,
  clientWorkIsPublishable,
  ownWork,
  type WorkItem,
} from "@/lib/company";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

/**
 * ── THE DESCRIPTION FOLLOWS THE PERMISSION GATE ─────────────────────────────
 *
 * A meta description is the snippet Google shows under the title, so it is a
 * promise made to somebody who has not yet clicked. While the client list
 * is gated this page names no client, and the description that used to sit
 * here — "Delivered client work ... booking systems, mobile-money payment
 * paths" — described the page it will become rather than the page that is
 * served. Somebody arriving on that promise found a holding notice.
 *
 * So it is derived from the same flag that decides the body. The day the last
 * permission lands, the flag flips and the snippet becomes true in the same
 * commit as the content, with nobody having to remember this file.
 */
export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /work and /work/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/work/" },
  title: "Work",
  description: clientWorkIsPublishable
    ? "Work from Genmars Tech — a multi-tenant point of sale we own and run, booking systems, and mobile-money payment paths built for Kenyan market realities."
    : "The Genmars Business Platform, a multi-tenant point of sale we own and run. Delivered client systems are not named here until written permission is on file.",
};

/**
 * Work.
 *
 * ── TWO SECTIONS, BECAUSE THE PERMISSION BELONGS TO TWO DIFFERENT PEOPLE ───
 *
 * What Genmars owns and runs needs nobody's consent; it is ours to show. What
 * we built for a client needs theirs, in writing — Charter 04 §V, "Genmars is
 * credited only with written permission" — and one missing permission still
 * hides the whole client list rather than publishing a partial one that
 * implies the rest.
 *
 * Naming a client publicly without their agreement is the kind of thing that
 * costs a relationship, and the charter anticipated it. Gating our own product
 * on the same flag was never that caution; it was an accident of the flag
 * being applied to every row.
 *
 * Descriptions state what each system observably does. No invented metrics.
 */
export default function WorkPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Work</p>
            {/*
              ── THE HEADLINE HAS TO BE TRUE OF EVERYTHING BELOW IT ─────────
              It used to read "Systems that took money on the first day",
              which was exact for two client sites that did. The Business
              Platform is running software with no shops trading on it yet, so
              the old line became a claim about takings it has not had. The
              money sentence still belongs to the client work and now sits in
              the band that is about it, where it is true. Charter 04 §IV
              does not have an exception for a headline.
            */}
            <h1 className={styles.title}>
              Software that is running, not planned.
            </h1>
            <p className="lede measure">
              All of it ships the same unglamorous thing: a way for a Kenyan
              business to be booked, sold to and paid without someone re-typing
              it into a spreadsheet afterwards.
            </p>
          </Reveal>
        </div>
      </section>

      {/*
        Ours first. It is the only thing on this page we can show without
        asking anybody, and a visitor who scrolls past a holding notice to
        reach it would conclude there was nothing here.
      */}
      {ownWork.length > 0 ? (
        <section className="section">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">What we own and run</p>
            </Reveal>
            <div className={styles.list}>
              {ownWork.map((item, i) => (
                <Entry key={item.slug} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {clientWorkIsPublishable ? (
        <section className="section">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow">Delivered for clients</p>
            </Reveal>
            <div className={styles.list}>
              {clientWork.map((item, i) => (
                <Entry
                  key={item.slug}
                  item={item}
                  index={ownWork.length + i}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="wrap">
            <Reveal className={styles.holding}>
              <h2 className={styles.holdingTitle}>
                Our client work is waiting on permission.
              </h2>
              <p className={styles.holdingBody}>
                We have delivered systems for other people that we would like
                to show you. We have not yet asked those clients, in writing,
                whether we may name them — and until we have, their names stay
                off this page.
              </p>
              <p className={styles.holdingBody}>
                Our own charter is the reason: client-owned software carries the
                client&rsquo;s brand, and Genmars is credited only with written
                permission. A firm that publishes your name without asking is
                telling you exactly how it will treat your data.
              </p>
              <p className={styles.holdingBody}>
                Ask us directly and we will walk you through what we have built,
                with the client&rsquo;s knowledge.
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
      )}

      <section className={`band-invert section ${styles.pattern}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">The common thread</p>
            <div className={styles.patternHead}>
              <h2>Built for how this market actually pays.</h2>
              <p className="lede measure">
                Mobile money is not an integration you bolt on at the end here
                — it is the payment rail. None of this would work as a
                card-first checkout copied from somewhere else. The till records
                M-Pesa beside cash and card for the same reason — that is the
                split real customers arrive with.
              </p>
            </div>
          </Reveal>

          <div className={styles.threads}>
            {[
              {
                title: "M-Pesa as a first-class path",
                detail:
                  "Paybill and till flows sit alongside card and cash, because that is the split real customers arrive with.",
              },
              {
                title: "Enquiry where people already are",
                detail:
                  "WhatsApp routing is not a shortcut around a proper system; it is where the conversation actually happens.",
              },
              {
                title: "Booking that survives being busy",
                detail:
                  "Confirmed slots, selectable staff, published prices — so the phone stops being the booking system.",
              },
            ].map((thread, i) => (
              <Reveal key={thread.title} delay={i * 90} className={styles.thread}>
                <h3 className={styles.threadTitle}>{thread.title}</h3>
                <p>{thread.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Something similar in mind?</h2>
            <p className="lede">
              Tell us what is going wrong today. The request form asks four
              questions and composes the email for you.
            </p>
            <div className={styles.holdingActions}>
              <Link href="/services/" className="btn">
                Request work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/**
 * One system.
 *
 * ── THE LABEL IS NOT RENDERED HERE, AND SHOULD BE ─────────────────────────
 * `WorkLabel` exists so a concept cannot be written up in the language of a
 * delivered system. Everything currently on this page is live software, so
 * nothing is misread today — but the day a "Concept" is added, this is where
 * it has to say so. Left as a note rather than a badge nobody needs yet.
 */
function Entry({ item, index }: { item: WorkItem; index: number }) {
  return (
    <Reveal as="article" delay={index * 90} className={styles.item}>
      <div className={styles.itemMeta}>
        <span className={styles.itemNum}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={styles.itemSector}>{item.sector}</span>
        <span className={styles.itemYear}>{item.year}</span>
      </div>

      <div className={styles.itemBody}>
        <h2 className={styles.itemClient}>{item.client}</h2>
        <hr className="rule--accent" />
        <p className={styles.itemSummary}>{item.summary}</p>
        <p className={styles.itemDetail}>{item.detail}</p>

        {item.architecture ? (
          <p className={styles.itemDetail}>{item.architecture}</p>
        ) : null}
        {item.engineering ? (
          <p className={styles.itemDetail}>{item.engineering}</p>
        ) : null}

        <ul className={styles.caps}>
          {item.capabilities.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>

        <a
          href={item.url}
          className={styles.visit}
          rel="noreferrer noopener"
          target="_blank"
        >
          {item.domain}
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
      </div>
    </Reveal>
  );
}
