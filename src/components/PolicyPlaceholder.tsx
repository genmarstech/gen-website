import Link from "next/link";
import { contact } from "@/lib/company";
import styles from "./PolicyPlaceholder.module.css";

/**
 * Placeholder for the two public policy documents.
 *
 * DELIBERATELY NOT DRAFTED HERE. The real text lives in the company folder at
 * 05-policies/Genmars-Policy-Pack-v0.1.pdf — Document A (Privacy Policy) and
 * Document B (Terms of Service). Both are drafting templates carrying blanks,
 * and the Policy Pack states plainly that they are not legal advice and must be
 * reviewed by an advocate before they appear on a live site.
 *
 * Writing plausible-sounding legal text here would be the worst possible move.
 * The Policy Pack's own governing rule: "A published policy is a promise. If the
 * privacy policy says data is encrypted at rest and it is not, that is a
 * misrepresentation to every user who read it." Generated boilerplate makes
 * promises nobody has checked.
 *
 * The route exists so the footer links resolve and the structure is in place.
 * Charter 03 §IV Tier 1 blocks launch until both are genuinely published — see
 * docs/PRE-LAUNCH.md.
 */

type Props = {
  title: string;
  documentLabel: string;
  /** Where the source text is to be transposed from. */
  source: string;
};

export function PolicyPlaceholder({ title, documentLabel, source }: Props) {
  return (
    <section className={`section section--flush ${styles.wrapper}`}>
      <div className="wrap">
        <div className={styles.inner}>
          <p className="eyebrow">Legal</p>
          <h1 className={styles.title}>{title}</h1>

          <div className={styles.notice} role="note">
            <p className={styles.noticeTitle}>
              This document is not yet published.
            </p>
            <p>
              {documentLabel} exists in draft and is awaiting review before it
              goes on a live page. Until that review is complete, nothing is
              published here — a policy that has not been checked is a promise
              nobody has verified, and that is worse than an empty page.
            </p>
          </div>

          <p className={styles.body}>
            This site is not open to the public while that work is outstanding.
            If you need to know how {" "}
            <span className={styles.nowrap}>Genmars Tech</span> would handle your
            data before then, ask us directly and you will get a straight answer
            in writing.
          </p>

          <p className={styles.body}>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>

          <hr className="rule" />

          <p className={styles.meta}>
            <span className={styles.metaLabel}>Source to transpose</span>
            {source}
          </p>

          <p className={styles.back}>
            <Link href="/">&larr; Back to the site</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
