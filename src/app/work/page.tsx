import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { API_ORIGIN, loadWorkOrEmpty } from "@/lib/work";
import { LiveWork } from "./LiveWork";
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
 * ── THE LIST IS BUILT, THEN REFRESHED IN THE BROWSER ──────────────────────
 *
 * This page still fetches at build time and still writes real HTML — that is
 * what a crawler reads and what renders with JavaScript off. LiveWork then
 * re-reads the API on the client and swaps in anything newer, so publishing
 * in operations shows up on the next page load rather than at the next
 * deploy. It can only add freshness; every failure keeps the built copy.
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

      <LiveWork initial={payload} origin={API_ORIGIN} />

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
