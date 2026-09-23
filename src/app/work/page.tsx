import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { byCategory, loadWorkOrEmpty, type WorkItem } from "@/lib/work";
import styles from "./page.module.css";

/**
 * Work.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE HOLDING NOTICE IS GONE, AND THE RULE IT ENFORCED IS NOT.
 *
 * This page used to be all-or-nothing: one client without written permission
 * hid everything, including work Genmars owns outright, and in its place sat
 * three paragraphs explaining Charter 04 §V to somebody who had come to see
 * what we build.
 *
 * The rule survives and has moved somewhere better. Consent is now enforced
 * by the queryset in gen-portal that answers this endpoint — an item naming a
 * client is simply absent until their permission is on file — so the page can
 * render whatever it is given without needing to explain an absence. Our own
 * products have nobody to ask and always show.
 *
 * What a visitor gets is therefore the work, grouped, or one honest line. Not
 * a lecture.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Descriptions state what each system observably does. No invented metrics —
 * the `results` field is empty unless somebody measured something.
 */

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /work and /work/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/work/" },
  title: "Work",
  description:
    "Sites, apps, custom software, design systems, tools and integrations built by Genmars Tech for Kenyan businesses.",
};

export default async function WorkPage() {
  const payload = await loadWorkOrEmpty();
  const groups = byCategory(payload).filter((g) => g.items.length > 0);
  const total = payload.work.length;

  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Work</p>
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

      {total === 0 ? (
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
                Ask us directly and we will walk you through what we have
                built.
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
      ) : (
        groups.map((group) => (
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
        ))
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
 * The label is rendered now, which it was not before. `WorkLabel` existed so a
 * concept could not be written up in the language of a delivered system, and
 * then nothing printed it — the safeguard was in the type and not on the page.
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
        {item.detail ? (
          <p className={styles.itemDetail}>{item.detail}</p>
        ) : null}
        {item.architecture ? (
          <p className={styles.itemDetail}>{item.architecture}</p>
        ) : null}
        {item.engineering ? (
          <p className={styles.itemDetail}>{item.engineering}</p>
        ) : null}
        {item.results ? (
          <p className={styles.itemDetail}>{item.results}</p>
        ) : null}

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
