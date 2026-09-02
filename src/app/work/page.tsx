import type { Metadata } from "next";
import Link from "next/link";
import { work, workIsPublishable } from "@/lib/company";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /work and /work/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/work/" },
  title: "Work",
  description:
    "Delivered client work from Genmars Tech — booking systems, mobile-money payment paths, and sites built for Kenyan market realities.",
};

/**
 * Work.
 *
 * ⚠ GATED ON WRITTEN PERMISSION. Charter 04 §V: "Genmars is credited only with
 * written permission." Until every entry in `work` has `permissionOnFile: true`,
 * this page shows the honest holding state instead of the projects.
 *
 * That is not excessive caution — naming a client publicly without their
 * agreement is the kind of thing that costs a relationship, and the charter
 * anticipated it. One missing permission hides the whole list rather than
 * publishing a partial one that implies the rest.
 *
 * Descriptions state what each live site observably does. No invented metrics.
 */
export default function WorkPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Work</p>
            <h1 className={styles.title}>
              Systems that took money on the first day.
            </h1>
            <p className="lede measure">
              Both of these ship the same unglamorous thing: a way for a Kenyan
              business to be booked and paid without someone re-typing it into a
              spreadsheet afterwards.
            </p>
          </Reveal>
        </div>
      </section>

      {workIsPublishable ? (
        <section className="section">
          <div className="wrap">
            <div className={styles.list}>
              {work.map((item, i) => (
                <Reveal
                  as="article"
                  key={item.slug}
                  delay={i * 90}
                  className={styles.item}
                >
                  <div className={styles.itemMeta}>
                    <span className={styles.itemNum}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.itemSector}>{item.sector}</span>
                    <span className={styles.itemYear}>{item.year}</span>
                  </div>

                  <div className={styles.itemBody}>
                    <h2 className={styles.itemClient}>{item.client}</h2>
                    <hr className="rule--accent" />
                    <p className={styles.itemSummary}>{item.summary}</p>
                    <p className={styles.itemDetail}>{item.detail}</p>

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
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <div className="wrap">
            <Reveal className={styles.holding}>
              <h2 className={styles.holdingTitle}>
                This page is waiting on permission.
              </h2>
              <p className={styles.holdingBody}>
                We have delivered work we would like to show you. We have not yet
                asked those clients, in writing, whether we may name them — and
                until we have, their names stay off this page.
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
                Mobile money is not an integration you bolt on at the end here —
                it is the payment rail. Neither of these would work as a
                card-first checkout copied from somewhere else.
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
