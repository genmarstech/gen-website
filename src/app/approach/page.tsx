import type { Metadata } from "next";
import Link from "next/link";
import {
  definitionOfDone,
  incidentPractice,
  principles,
  securityTiers,
  stack,
} from "@/lib/company";
import { Reveal } from "@/components/Reveal";
import { GatesMark } from "@/components/Illustration";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "The stack Genmars Tech runs, the definition of done every project is held to, the security gates a system passes before it goes live, and how incidents are handled.",
};

/**
 * Approach.
 *
 * This page is the site's proof. A Stage 0 company has no case studies, so what
 * it can offer instead is the standard itself, published before anyone signs
 * anything. Every item here is transcribed from Charter 03 — nothing is
 * aspirational, and no response time or SLA appears anywhere (see the note on
 * incidentPractice in src/lib/company.ts).
 */
export default function ApproachPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">Approach</p>
          <h1 className={styles.title}>
            Handing over a repository is not delivery.
          </h1>
          <p className="lede measure">
            We deploy, monitor, and maintain what we build. This page is the
            standard that applies to every engagement — published in full, so you
            can hold us to it rather than take our word for it.
          </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- the stack ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">The stack</p>
          <div className={styles.sectionHead}>
            <h2>Deliberately narrow.</h2>
            <p className="lede measure">
              Narrowness is the point. It makes one engineer as productive as
              three, and it makes the next engineers cheap to onboard. A new tool
              enters this list only when something already on it genuinely cannot
              do the job — and then it is supported forever, or deliberately
              removed.
            </p>
          </div>
          </Reveal>

          <dl className={styles.stack}>
            {stack.map((row) => (
              <div key={row.layer} className={styles.stackRow}>
                <dt>{row.layer}</dt>
                <dd>{row.standard}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.stackNote}>
            If you need something we do not run, we will tell you that — and
            either decline it or subcontract it with your written knowledge. We
            do not claim technology we do not operate in production.
          </p>
        </div>
      </section>

      {/* ---------- definition of done ---------- */}
      <section className={`band-invert section ${styles.done}`}>
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">Definition of done</p>
          <div className={styles.sectionHead}>
            <h2>Six things, all true at once.</h2>
            <p className="lede measure">
              Partially done is not done, and is never reported to you as done.
            </p>
          </div>
          </Reveal>

          <ol className={styles.doneList}>
            {definitionOfDone.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- security ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">Security baseline</p>
          <div className={styles.sectionHead}>
            <h2>Three tiers. Each one is a gate, not a wish list.</h2>
            <p className="lede measure">
              Tier 1 is not negotiable: no client system of ours goes live
              without every item on it.
            </p>
          </div>
          </Reveal>

          <Reveal className={styles.gatesArt}>
            <GatesMark />
          </Reveal>

          <div className={styles.tiers}>
            {securityTiers.map((tier, i) => (
              <Reveal key={tier.tier} delay={i * 110} className={styles.tier}>
                <div className={styles.tierHead}>
                  <h3 className={styles.tierName}>{tier.tier}</h3>
                  <p className={styles.tierWhen}>{tier.when}</p>
                </div>
                <ul className={styles.tierList}>
                  {tier.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- incidents ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">When something breaks</p>
          <div className={styles.sectionHead}>
            <h2>Severity decides the response.</h2>
          </div>
          </Reveal>

          <dl className={styles.sev}>
            {incidentPractice.severities.map((row) => (
              <div key={row.severity} className={styles.sevRow}>
                <dt>{row.severity}</dt>
                <dd>{row.definition}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.sevNote}>{incidentPractice.postMortem}</p>

          {/*
            No response times published. Charter 03 §IV standing rule: never put
            a service-level commitment in front of a client that has not been
            tested in practice. A missed SLA on paper is worse than no SLA.
          */}
          <p className={styles.sevCaveat}>
            We have not published response-time commitments here. We hold
            internal targets, but we will not advertise a number we have not yet
            had to meet under real conditions — a missed commitment on paper is
            worse than no commitment at all. Response times are written into the
            retainer agreement, where they are specific to your system.
          </p>
        </div>
      </section>

      {/* ---------- principles ---------- */}
      <section className={`section ${styles.principles}`}>
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">What we hold to</p>
          <div className={styles.sectionHead}>
            <h2>Six principles that decide arguments.</h2>
          </div>
          </Reveal>

          <div className={styles.principleGrid}>
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} className={styles.principle}>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p>{p.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Hold us to it.</h2>
            <p className="lede">
              If anything on this page does not match what you experience working
              with us, that is a legitimate complaint and we would want to hear
              it.
            </p>
            <div className={styles.actions}>
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
