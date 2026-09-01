import type { Metadata } from "next";
import Link from "next/link";
import { company, contact } from "@/lib/company";
import { portal, PORTAL_API_ORIGIN } from "@/lib/portal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What genmars.co.ke collects, why, how long it is kept, and your rights. Short, because the site collects almost nothing.",
  robots: { index: false, follow: false },
};

/**
 * Privacy policy.
 *
 * ── EVERY CLAIM HERE IS VERIFIED ────────────────────────────────────────────
 * Written from ../../../../05-policies/data-processing-record.md, which records
 * what the running system actually does — checked, not assumed.
 *
 * The Policy Pack's governing rule: "A published policy is a promise. If the
 * privacy policy says data is encrypted at rest and it is not, that is a
 * misrepresentation to every user who read it."
 *
 * So: no control is claimed here that is not in place today. Specifically NOT
 * claimed, because they are Charter 03 §IV Tier 2/3 items that are not met:
 *   - encryption of personal data at rest
 *   - audit logging on sensitive actions
 *   - access reviews
 *   - any support response time
 *
 * ── STILL PENDING ───────────────────────────────────────────────────────────
 * TODO(pre-launch): remove <ReviewNotice /> once an advocate has reviewed this
 * alongside the Terms of Service, the Client Agreement Pack and the Ownership
 * Term Sheet — one engagement, per the Policy Pack.
 *
 * TODO(pre-launch): privacy@genmars.co.ke must exist and be monitored. This
 * page names it as the address for data requests; an address that bounces is
 * worse than none.
 *
 * TODO(pre-launch): the controller/processor registration position with the
 * Office of the Data Protection Commissioner is still open (Charter 03 §V).
 * That determines how this document should frame itself.
 *
 * ── v0.2, and what it did NOT do ────────────────────────────────────────────
 * Request work now routes through an account on app.genmars.co.ke, which made
 * two statements on this page false the moment the link shipped: "No accounts,
 * there is nothing to sign up for", and a browser-storage section naming one
 * key when the site had begun writing three. Both are corrected above, and the
 * portal is now described as the separate system it is.
 *
 * That is a correction, NOT the rewrite this document needs. PORTAL-INTEGRATION.md
 * §5.2 is still open and is still a launch blocker: once the portal holds one
 * real client account, this policy has to be rewritten against the data
 * processing record rather than patched, and the portal needs a published
 * policy of its own for the sentences above to point at. Do not read v0.2 as
 * that work being done.
 *
 * If the retention period in journald changes, THIS PAGE CHANGES. A policy
 * stating 30 days while the server keeps 90 is a misrepresentation.
 */

const UPDATED = "1 September 2026";
const VERSION = "0.2";

export default function PrivacyPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <div className={styles.doc}>
            <p className="eyebrow">Legal</p>
            <h1 className={styles.title}>Privacy policy</h1>
            <p className={`lede ${styles.lede}`}>
              This is a short document, because the site collects almost nothing.
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
                <dd>{company.domain}</dd>
              </div>
            </dl>

            <ReviewNotice />
          </div>
        </div>
      </section>

      <section className={`section ${styles.body}`}>
        <div className="wrap">
          <article className={styles.doc}>
            <h2>Who this is about</h2>
            <p>
              {company.legalName} (registration {company.registrationNumber}) of{" "}
              {company.city}, {company.country}, operates this website at{" "}
              {company.domain}.
            </p>

            <h2>What we collect</h2>
            <p>
              One thing. When you request a page, our server records the request
              in its log:
            </p>
            <ul>
              <li>Your IP address</li>
              <li>The date and time</li>
              <li>The page you asked for, and the response we gave</li>
              <li>
                Your browser&rsquo;s user-agent string, and the referring page if
                your browser sent one
              </li>
            </ul>
            <p>
              We use this to keep the site running, to diagnose faults, and to
              investigate abuse. Nothing else.
            </p>

            <h2>What we do not collect</h2>
            <p>
              This list is longer than the one above, and that is the point.
            </p>
            <ul>
              <li>
                <strong>No cookies.</strong> This site sets none. That is why
                there is no consent banner &mdash; there is nothing to consent to.
              </li>
              <li>
                <strong>No analytics.</strong> No Google Analytics, no Plausible,
                no Matomo, no equivalent.
              </li>
              <li>
                <strong>No tracking pixels, embeds, or advertising.</strong>
              </li>
              <li>
                <strong>No third-party requests.</strong> Fonts are served from
                our own server, so your browser does not contact anyone else while
                loading this site.
              </li>
              <li>
                <strong>No accounts on this site.</strong> There is nothing to
                sign in to here, and nothing on this domain holds a password.
                Accounts live on the client portal at{" "}
                <a href={portal.origin}>{portal.host}</a>, which is a separate
                system on a separate domain &mdash; see below.
              </li>
            </ul>

            <h2>The request form does not send us anything</h2>
            <p>
              The form at <Link href="/request/">Request work</Link> looks like a
              contact form and behaves like one, but nothing you type is
              submitted to us or to anyone else. It stays in your browser, and
              the button opens your own email application with the message
              already written.
            </p>
            <p>
              We built it that way deliberately, so that your details never pass
              through a third-party form service. What reaches us afterwards is
              an ordinary email that you chose to send, and you keep a copy of it.
            </p>
            <p>
              Reaching that form asks you to set up a client account first. That
              happens entirely on <a href={portal.origin}>{portal.host}</a>: what
              you type into the account setup is collected by the portal under
              its own privacy policy, not by this site. This site is told nothing
              about it &mdash; not your name, not your email address, not whether
              you completed it. All it records is a flag in your own browser
              saying &ldquo;this person has been to the portal&rdquo;, so that it
              does not ask you a second time.
            </p>

            <h2>The client portal is a separate system</h2>
            <p>
              <a href={portal.origin}>{portal.host}</a> and its API at{" "}
              {PORTAL_API_ORIGIN.replace("https://", "")} run on different
              software from this site, and hold different things. Accounts,
              passwords, and the details of work we are doing for a client live
              there. None of it is on {company.domain}, and this site has no way
              to read it.
            </p>
            <p>
              That separation is the reason this policy can be as short as it is.
              If you have a portal account, the portal&rsquo;s own privacy policy
              governs it.
            </p>

            <h2>What your browser stores</h2>
            <p>
              This site writes three values to your browser&rsquo;s local
              storage. All three stay on your device, are never transmitted to
              us, and we cannot read them. Clearing your browser&rsquo;s storage
              for this site removes all of them.
            </p>
            <ul>
              <li>
                <code>gm-theme</code> &mdash; your light or dark theme choice, if
                you made one.
              </li>
              <li>
                <code>gm-request-draft</code> &mdash; whatever you have typed
                into the request form, so that it survives a reload or the trip
                to the portal and back. Written as you type. You can delete it at
                any time with the &ldquo;Start again&rdquo; link on that page.
              </li>
              <li>
                <code>gm-portal-account</code> &mdash; a single yes/no flag
                recording that you came back from the portal, so the request page
                does not send you there again. It holds nothing about you: not
                your name, not your email address, not a session or a token.
              </li>
            </ul>

            <h2>Who else is involved</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Who</th>
                  <th>What they do</th>
                  <th>What they can see</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hetzner</td>
                  <td>Hosts the server</td>
                  <td>Traffic at the infrastructure level</td>
                </tr>
                <tr>
                  <td>Cloudflare</td>
                  <td>Provides DNS for our domain</td>
                  <td>
                    Which domain was looked up. Not the pages you visit or
                    anything you send
                  </td>
                </tr>
                <tr>
                  <td>Let&rsquo;s Encrypt</td>
                  <td>Issues our security certificate</td>
                  <td>Our domain name only</td>
                </tr>
              </tbody>
            </table>

            <h2>How long we keep it</h2>
            <p>
              Server logs are kept for <strong>30 days</strong> and then deleted
              automatically. We do not archive them elsewhere.
            </p>
            <p>Email is kept on a schedule:</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>What</th>
                  <th>How long</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Spam and deleted items</td>
                  <td>30 days</td>
                </tr>
                <tr>
                  <td>An enquiry that does not become work</td>
                  <td>12 months</td>
                </tr>
                <tr>
                  <td>Correspondence with a client</td>
                  <td>7 years after the work ends</td>
                </tr>
              </tbody>
            </table>
            <p>
              The seven-year figure is not us being reluctant to let go: Kenyan
              tax law requires business records to be kept for five years, and
              the period during which a contract claim can be brought is six.
              Signed contracts and filings are company records and are kept
              permanently.
            </p>

            <h2>How it is protected</h2>
            <p>
              We list only measures that are actually in place:
            </p>
            <ul>
              <li>
                All traffic to this site is encrypted in transit; plain HTTP
                requests are redirected to HTTPS
              </li>
              <li>
                The web server runs as an unprivileged user in an isolated
                container with a read-only filesystem, reachable only through our
                own proxy
              </li>
              <li>
                This site holds no database and stores no personal data at rest.
                Client accounts and the data behind them are on the portal, on a
                different server, under its own policy
              </li>
            </ul>

            <h2>Your rights</h2>
            <p>
              Under the Kenyan Data Protection Act, you have the right to be
              informed how your data is used, to ask for a copy of it, to have it
              corrected or deleted, and to object to how it is being processed.
            </p>
            <p>
              In practice, the only data we hold about a visitor is a server log
              entry keyed to an IP address, for 30 days. If you want to exercise
              any of these rights, write to us and tell us the approximate date
              and time of your visit and the IP address you used, since without
              those we cannot identify your entries.
            </p>

            <h2>How to reach us</h2>
            <p>
              For anything about this policy or your data:{" "}
              <a href={`mailto:${contact.privacyEmail}`}>
                {contact.privacyEmail}
              </a>
              .
            </p>
            <p>
              For anything else: <a href={`mailto:${contact.email}`}>{contact.email}</a>.
            </p>
            <p>
              If you are not satisfied with our response, you may complain to the
              Office of the Data Protection Commissioner of Kenya.
            </p>

            <h2>Changes</h2>
            <p>
              If we change what we collect or how long we keep it, we change this
              page and the date at the top. We do not make changes quietly.
            </p>

            <hr className="rule" />

            <p className={styles.footnote}>
              <Link href="/terms/">Terms of service</Link> &middot;{" "}
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
 * The Policy Pack is explicit that Documents A and B are drafting templates and
 * not legal advice. Saying so on the page is uncomfortable but honest, and this
 * site is not published — it carries noindex and a disallow-all robots.txt.
 * Remove this component when the advocate has signed off.
 */
function ReviewNotice() {
  return (
    <aside className={styles.notice} role="note">
      <p className={styles.noticeTitle}>This document is still in draft.</p>
      <p>
        Everything stated here is accurate &mdash; it was written from a record of
        what our systems actually do, not from a template. It has not yet been
        reviewed by an advocate, and this notice stays until it has.
      </p>
    </aside>
  );
}
