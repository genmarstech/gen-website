import type { Metadata } from "next";
import Link from "next/link";
import { company, contact } from "@/lib/company";
import { portal } from "@/lib/portal";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /terms and /terms/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/terms/" },
  title: "Terms of service",
  description:
    "The terms for using genmars.co.ke and for holding a Genmars client portal account. The work itself is governed by a separate signed agreement.",
};

/**
 * Terms of service.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * THIS PAGE WAS ALREADY BEING RELIED ON BEFORE IT EXISTED.
 *
 * The portal sign-up screen has linked here since it shipped, with the sentence
 * "by creating an account you agree to the terms of service". Until this
 * document replaced the placeholder, that sentence pointed at a page saying
 * "this document is not yet published" — real accounts were created against
 * terms that did not exist. That is the defect this closes.
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ── WHAT IT DOES AND DOES NOT COVER ─────────────────────────────────────────
 *
 * Two things: reading this website, and holding a portal account. NOT the work.
 * Paid work runs on the Terms of Business (05-policies/), because a click-through
 * on a website is the wrong instrument for scope, price, IP and liability, and a
 * client who has signed a statement of work should not have those terms silently
 * amended by an edit to a web page.
 *
 * ── EVERY COMMITMENT HERE IS ONE THE SYSTEM ACTUALLY MEETS ──────────────────
 *
 * Charter 03 §IV forbids publishing an untested response time and Charter 04 §IV
 * forbids anything untrue on a Genmars surface. So clause 8 states plainly that
 * there is NO uptime commitment on the portal, because there is no monitoring
 * contract behind one. Do not soften that sentence into "we aim for high
 * availability" — that is a commitment with the accountability filed off.
 *
 * The no-hostage clause (13) is Charter 05 §VIII and is not boilerplate: it is
 * the single promise on this page a competitor is least likely to make.
 *
 * TODO(pre-launch): remove <ReviewNotice /> once an advocate has reviewed this
 * alongside the privacy policy, the Terms of Business and the DPA — one
 * engagement, per the Policy Pack.
 */

const UPDATED = "5 September 2026";
const VERSION = "1.0";

export default function TermsPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <div className={styles.doc}>
            <p className="eyebrow">Legal</p>
            <h1 className={styles.title}>Terms of service</h1>
            <p className={`lede ${styles.lede}`}>
              These cover reading this website and holding an account on our
              client portal. They do not cover work we do for you &mdash; that
              has its own signed agreement, and this page cannot change it.
            </p>

            <dl className={styles.meta}>
              <div>
                <dt>Last updated</dt>
                <dd>{UPDATED}</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{VERSION}</dd>
              </div>
              <div>
                <dt>Applies to</dt>
                <dd>
                  {company.domain} and {portal.host}
                </dd>
              </div>
            </dl>

            <ReviewNotice />
          </div>
        </div>
      </section>

      <section className={`section ${styles.body}`}>
        <div className="wrap">
          <article className={styles.doc}>
            <h2>1. Who you are agreeing with</h2>
            <p>
              {company.legalName} (registration {company.registrationNumber}), of{" "}
              {company.city}, {company.country}. In these terms,
              &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;Genmars&rdquo; mean
              that company, and &ldquo;you&rdquo; means the person reading this
              or holding an account.
            </p>

            <h2>2. What these terms cover, and what they do not</h2>
            <p>They cover two things:</p>
            <ul>
              <li>Reading and using this website at {company.domain}</li>
              <li>
                Holding an account on the client portal at{" "}
                <a href={portal.origin}>{portal.host}</a>
              </li>
            </ul>
            <p>
              They do not cover work we do for you. Every paid engagement runs on
              a separate written agreement &mdash; our Terms of Business together
              with a statement of work describing what was actually agreed. Where
              those and this page disagree about anything to do with the work,
              the signed agreement wins. We cannot change the terms of your
              engagement by editing this page, and we will not try to.
            </p>

            <h2>3. This website</h2>
            <p>
              You may read it, quote it, and link to it. It is published for
              information; nothing on it is an offer capable of acceptance, and a
              price shown here is indicative until we have put a figure in
              writing for your specific work.
            </p>
            <p>
              There is no form on this site and nothing to sign in to. Ordering a
              service is a link that opens the portal.
            </p>

            <h2>4. Who may open a portal account</h2>
            <p>
              The portal is for businesses and organisations we work with or are
              talking to about work. By opening an account you confirm that you
              are at least eighteen, and that you are authorised to act for the
              organisation you name. If you are not sure you have that authority,
              you probably do not &mdash; ask first.
            </p>
            <p>
              An account belongs to a person; the work belongs to the
              organisation. If you leave that organisation, your access can be
              removed by them or by us at their request, and the record of the
              work stays with the organisation.
            </p>

            <h2>5. Looking after your account</h2>
            <ul>
              <li>
                Give us details that are true, and keep your email address
                current &mdash; it is how we reach you and how you get back in
              </li>
              <li>
                Your password is yours. Do not share it, and do not use one you
                have used somewhere else
              </li>
              <li>
                Tell us at once if you think someone else has got into your
                account, at{" "}
                <a href={`mailto:${contact.securityEmail}`}>
                  {contact.securityEmail}
                </a>
              </li>
            </ul>
            <p>
              We will never ask you for your password, and no email from us will
              ever ask you to send one. A message that does is not from us.
            </p>

            <h2>6. What you may not do</h2>
            <p>
              This list is short and specific rather than long and vague, so that
              it is possible to actually comply with it.
            </p>
            <ol className={styles.clauses}>
              <li>
                Try to reach data belonging to another organisation, whether by
                guessing a reference, altering an address, or any other means.
              </li>
              <li>
                Attack the service or test its defences without our written
                permission &mdash; including scanning, brute force, denial of
                service, or attempts to bypass rate limits or authentication.
              </li>
              <li>
                Automate access to the portal, or scrape it, without our written
                permission.
              </li>
              <li>
                Upload anything unlawful, or anything containing malware.
              </li>
              <li>
                Use the service to store personal data you have no lawful basis
                to hold.
              </li>
            </ol>
            <p>
              Finding a security flaw and telling us about it is not on that
              list, and is welcome. Write to{" "}
              <a href={`mailto:${contact.securityEmail}`}>
                {contact.securityEmail}
              </a>
              . We will not pursue anyone who reports a genuine flaw in good
              faith, does not access or alter anyone else&rsquo;s data beyond
              what is needed to demonstrate it, and gives us a reasonable chance
              to fix it before saying so publicly.
            </p>

            <h2>7. What you put into the portal</h2>
            <p>
              What you upload or type stays yours. You give us permission to
              store and process it only so far as is needed to run the service
              and do the work you have asked for. We do not use it to train
              anything, we do not sell it, and we do not share it with anyone
              outside the list in our{" "}
              <Link href="/privacy/">privacy policy</Link>.
            </p>
            <p>
              You are responsible for having the right to give us what you give
              us &mdash; particularly where it contains personal data about other
              people, such as your own customers or staff. Where that happens,
              our Data Processing Agreement governs it, and you are the data
              controller.
            </p>

            <h2>8. Availability &mdash; what we do not promise</h2>
            <p>
              <strong>
                We do not commit to an uptime figure or a response time for the
                portal, and you should not plan around one.
              </strong>{" "}
              The portal is a record of work in progress and a way to see and pay
              invoices. It is not the system your business runs on, and if it is
              unavailable for a while nothing you depend on stops.
            </p>
            <p>
              We would rather say that plainly than publish a number we have not
              built the monitoring to stand behind. Where you do buy a
              commitment from us &mdash; a support tier with a stated response
              time, or managed services on a system we run for you &mdash; that
              commitment is written into your agreement, and it is real.
            </p>
            <p>
              We may take the portal down for maintenance, and we may change how
              it works. Where a change removes something you rely on, we will
              tell you before we make it.
            </p>

            <h2>9. Invoices shown in the portal</h2>
            <p>
              The portal displays invoices and lets you pay some of them. The
              amount owed and the terms of payment come from your agreement with
              us, not from this page. If a figure shown in the portal does not
              match what you were quoted in writing, the written quote is what
              stands, and we want to hear about the discrepancy.
            </p>
            <p>
              Bank and mobile-money details for paying us appear on the invoice
              itself. We will never change them by email alone. If you receive a
              message that appears to be from us asking you to pay to different
              details, do not pay it &mdash; ring us first.
            </p>

            <h2>10. Our material</h2>
            <p>
              The design, text, code and images of this website and the portal
              are ours or licensed to us. You may not copy them for use in a
              competing service. This does not touch anything we build for you
              under a paid engagement &mdash; ownership of that is dealt with in
              your agreement, and normally it becomes yours on payment.
            </p>

            <h2>11. If something goes wrong</h2>
            <p>
              This website and the portal are provided as they are. Nothing in
              this section limits liability that cannot lawfully be limited
              &mdash; including for death or personal injury caused by
              negligence, or for fraud.
            </p>
            <p>
              Subject to that, and in relation to this website and your use of
              the portal only, we are not liable for indirect or consequential
              loss, loss of profit, or loss of data that you could reasonably
              have kept a copy of; and our total liability arising out of this
              website and the portal is limited to KES 50,000.
            </p>
            <p>
              That cap applies to <em>these terms</em>. Liability for the work we
              do for you is dealt with in your engagement agreement, at a level
              set against what that work is worth &mdash; it is not capped at
              this figure.
            </p>

            <h2>12. Suspending or closing an account</h2>
            <p>
              You can ask us to close your account at any time and we will,
              subject to clause 13.
            </p>
            <p>
              We may suspend an account immediately where we reasonably believe
              it has been compromised, or where clause 6 is being breached. Where
              we do that we will tell you why, in writing, unless telling you
              would defeat the point of doing it.
            </p>

            <h2>13. Your data on the way out</h2>
            <div className={styles.notice} role="note">
              <p className={styles.noticeTitle}>
                We do not hold data or domains hostage.
              </p>
              <p>
                If you leave &mdash; on good terms, on bad terms, or in the
                middle of a dispute about money &mdash; you get your data, and
                any domain we registered for you is transferred to you. That
                stands whether or not you owe us anything. An unpaid invoice is a
                debt to be pursued as a debt; it is not a reason to withhold
                something that is yours.
              </p>
            </div>
            <p>
              On request we will export what is yours in a usable format, and we
              will do it within a reasonable period rather than immediately,
              because someone has to do it by hand. After that, what we keep and
              for how long is set out in our{" "}
              <Link href="/privacy/">privacy policy</Link>. Records we are
              obliged to retain &mdash; issued invoices and signed agreements
              among them &mdash; we keep, because they are accounting and legal
              records and not ours to delete.
            </p>

            <h2>14. Changes to these terms</h2>
            <p>
              We may change this page. Where a change materially affects account
              holders we will email them at least fourteen days before it takes
              effect, and the date and version at the top of this page always
              tell you which version you are reading. Continuing to use the
              portal after a change takes effect means you accept it; if you do
              not, close the account, and clause 13 applies.
            </p>

            <h2>15. Law and disputes</h2>
            <p>
              These terms are governed by the laws of Kenya, and the courts of
              Kenya have jurisdiction.
            </p>
            <p>
              Before anyone goes to court, we would like a conversation. Write to{" "}
              <a href={`mailto:${contact.email}`}>{contact.email}</a> setting out
              what is wrong and what you want done about it, and we will reply
              within fourteen days. Most things end there.
            </p>

            <h2>16. How to reach us</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>About</th>
                  <th>Write to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Anything on this page</td>
                  <td>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </td>
                </tr>
                <tr>
                  <td>Your data, or this policy&rsquo;s privacy side</td>
                  <td>
                    <a href={`mailto:${contact.privacyEmail}`}>
                      {contact.privacyEmail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>A security flaw</td>
                  <td>
                    <a href={`mailto:${contact.securityEmail}`}>
                      {contact.securityEmail}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            <hr className="rule" />

            <p className={styles.footnote}>
              <Link href="/privacy/">Privacy policy</Link> &middot;{" "}
              <Link href="/">Back to the site</Link>
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

/**
 * Visible while this document is still a draft.
 *
 * Same component and same reasoning as the privacy page — including that the
 * reasoning changed on 2026-09-05. The site is no longer noindex and no longer
 * disallow-all, so this notice is the only thing telling a reader that no
 * advocate has checked a document they may be relying on. It stays until one
 * has.
 */
function ReviewNotice() {
  return (
    <aside className={styles.notice} role="note">
      <p className={styles.noticeTitle}>This document is still in draft.</p>
      <p>
        It was written against what our systems actually do and what we are
        actually willing to promise, not from a template &mdash; but it has not
        yet been reviewed by an advocate, and this notice stays until it has.
      </p>
    </aside>
  );
}
