import Link from "next/link";
import {
  company,
  definitionOfDone,
  engines,
  offers,
  positioning,
} from "@/lib/company";
import { Wordmark } from "@/components/Brand";
import { MonitoredMark } from "@/components/Illustration";
import { OrbitSystem } from "@/components/OrbitSystem";
import { Starfield } from "@/components/Starfield";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

import type { Metadata } from "next";

/**
 * Only the canonical. Title, description and Open Graph come from the defaults
 * in layout.tsx and are correct for the home page already.
 *
 * Declared HERE rather than as `alternates` in layout.tsx on purpose: a
 * canonical in the root layout is inherited by every route that does not
 * override it, so the day someone adds a page and forgets one, that page
 * quietly tells Google it IS the home page and asks to be de-duplicated away.
 * Explicit per route means a missing canonical is merely missing.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};


/**
 * Home.
 *
 * Charter 04 §VI sets the brief for this surface exactly: "genmars.co.ke — what
 * we do, proof, how to reach us. No fabricated depth."
 *
 * There is no proof of the usual kind. Genmars is at Stage 0 and 07-executed/ is
 * empty — no signed contracts, so no case studies, no client logos, no
 * testimonials, no counts of projects delivered. Charter 04 §IV forbids
 * inventing any of it.
 *
 * So "proof" here is the verifiable kind: the stack we actually run, the
 * definition of done we actually hold to, and the security gates we actually
 * pass before anything goes live. Charter 04 §III — admit limits early, it is
 * the cheapest credibility available.
 */
export default function HomePage() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className={`section section--flush ${styles.hero}`}>
        {/* Behind everything. The hero already clips, so nothing escapes it. */}
        <Starfield />

        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <Wordmark width={260} className={styles.heroMark} />

            <h1 className={styles.heroTitle}>
              <span className={styles.heroLine}>Production software,</span>
              <span className={styles.heroLine}>not prototypes.</span>
            </h1>

            <p className={`lede ${styles.heroLede}`}>
              {company.formalName} builds custom systems, mobile-money and
              payments integration, and the infrastructure that keeps them
              running — for businesses in {company.country} and across East
              Africa.
            </p>

            <div className={styles.heroActions}>
              <Link href="/services/" className="btn">
                Request work
              </Link>
              <Link href="/work/" className="btn btn--ghost">
                See what we have built
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <OrbitSystem />
          </div>
        </div>

        <div className={`wrap ${styles.scrollHint}`}>
          <span className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ---------- what we do ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">What we do</p>
            <div className={styles.sectionHead}>
              <h2>What you can buy today.</h2>
              <p className="lede measure">
                Seven services, each with a starting price. There is a platform
                underneath them that we are still building &mdash; it is on the
                services page, marked as such, because we would rather show you
                where this is going than pretend it has arrived.
              </p>
            </div>
          </Reveal>

          <ul className={styles.offerList}>
            {offers
              .filter((offer) => offer.available === "now")
              .map((offer, i) => (
                <Reveal
                  as="li"
                  key={offer.slug}
                  delay={i * 70}
                  className={styles.offer}
                >
                  <span className={styles.offerNum}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.offerName}>{offer.name}</h3>
                  <p className={styles.offerLead}>{offer.lead}</p>
                  <p className={styles.offerPrice}>
                    from {offer.from}{" "}
                    <span className={styles.offerUnit}>{offer.unit}</span>
                  </p>
                </Reveal>
              ))}
          </ul>

          <Reveal className={styles.more}>
            <Link href="/services/">Read what each one involves &rarr;</Link>
          </Reveal>

          <Reveal className={styles.more}>
            <Link href="/services/">See the tiers and prices &rarr;</Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- proof, the only honest kind we have ---------- */}
      <section className={`band-invert section ${styles.proof}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">How to judge us</p>
            <div className={styles.sectionHead}>
              <h2>Ask us to prove it.</h2>
              <p className="lede measure">
                We publish the standard the work is held to, in full, before you
                have signed anything — so you can hold us to it rather than take
                our word for it. No stock photography, no invented team page, and
                no client logo goes up here without that client&rsquo;s written
                permission.
              </p>
            </div>
          </Reveal>

          <Reveal className={styles.proofArt}>
            <MonitoredMark />
            <p className={styles.proofArtCaption}>
              Deployed, monitored, maintained. Handing over a repository is not
              delivery.
            </p>
          </Reveal>

          <Reveal className={styles.doneBlock}>
            <h3 className={styles.doneTitle}>
              A project is done when all six are true
            </h3>
            <hr className="rule--accent" />
            <ol className={styles.doneList}>
              {definitionOfDone.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p className={styles.doneNote}>
              Partially done is not done, and is never reported as done.
            </p>
          </Reveal>

          <Reveal className={styles.more}>
            <Link href="/approach/">
              The stack, the security gates, and how we handle incidents &rarr;
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- two engines ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">How the company is built</p>
            <div className={styles.sectionHead}>
              <h2>Two engines, one roof.</h2>
            </div>
          </Reveal>

          <div className="grid grid--2">
            {engines.map((engine, i) => (
              <Reveal key={engine.name} delay={i * 110} className={styles.engine}>
                <h3 className={styles.engineName}>{engine.name}</h3>
                <hr className="rule--accent" />
                <p>{engine.summary}</p>
                <p className={styles.engineRole}>{engine.role}</p>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className={styles.engineNote}>
              Services buy the time. Products buy the future. Neither is
              subordinate to the other, and neither is allowed to starve.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- is / is not ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Where we stand</p>
          </Reveal>

          <div className={styles.standGrid}>
            <Reveal>
              <h2 className={styles.standTitle}>What Genmars is</h2>
              <dl className={styles.isList}>
                {positioning.is.map((item) => (
                  <div key={item.claim}>
                    <dt>{item.claim}</dt>
                    <dd>{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={140}>
              <h2 className={styles.standTitle}>What it is not</h2>
              <ul className={styles.isNotList}>
                {positioning.isNot.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- how to reach us ---------- */}
      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Tell us what is going wrong.</h2>
            <p className="lede">
              The useful first message is not a brief. It is the problem, what it
              costs you each month, and when it started.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact/" className="btn">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
