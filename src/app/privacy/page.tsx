import type { Metadata } from "next";
import Link from "next/link";
import { company, contact } from "@/lib/company";
import { portal, PORTAL_API_ORIGIN } from "@/lib/portal";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /privacy and /privacy/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/privacy/" },
  title: "Privacy policy",
  description:
    "What Genmars collects on genmars.co.ke and in the client portal, why, where it is stored, how long it is kept, and your rights under the Kenyan Data Protection Act.",
  robots: { index: false, follow: false },
};

/**
 * Privacy policy v1.0.
 *
 * ── EVERY CLAIM HERE IS VERIFIED AGAINST THE RUNNING SYSTEM ─────────────────
 *
 * The Policy Pack's governing rule: "A published policy is a promise. If the
 * privacy policy says data is encrypted at rest and it is not, that is a
 * misrepresentation to every user who read it."
 *
 * So no control is claimed here that is not in place today. Checked on
 * 2026-09-05 against settings.py, the models, and the production host:
 *
 *   CLAIMED, because verified:
 *     - Argon2 password hashing            config/settings.py PASSWORD_HASHERS
 *     - TLS everywhere, HSTS from Caddy    deploy/*.caddy
 *     - HttpOnly/Secure/SameSite session   settings SESSION_COOKIE_*
 *     - account lockout                    accounts.models.User.locked_until
 *     - rate limiting                      DEFAULT_THROTTLE_RATES
 *     - append-only activity log           portal.models.ActivityLog
 *     - tenant isolation, with tests       portal/selectors.py
 *     - GPG-encrypted backups              scripts/backup.sh, BACKUP_RECIPIENT
 *     - uploads never web-served           settings MEDIA_URL = ""
 *     - 30-day server log retention        journald MaxRetentionSec=30day
 *
 *   NOT CLAIMED, because NOT TRUE TODAY. Do not add any of these without
 *   changing the system first:
 *     - encryption of the database at rest — the production disk is plain
 *       ext4 with no LUKS. Backups are encrypted; the live database is not.
 *     - multi-factor authentication
 *     - formal periodic access reviews
 *     - any support response time (Charter 03 §IV)
 *     - 24/7 monitoring
 *
 * ── WHAT v1.0 ADDED, AND WHY IT HAD TO ──────────────────────────────────────
 *
 * v0.2 described a portal it did not document, and pointed at "the portal's own
 * privacy policy", which did not exist. The portal now holds real client
 * accounts, so Part 2 is that document, folded in here rather than published
 * separately: one controller, one policy, one place to look — and it stays
 * readable when the portal is down, which a policy hosted on the portal would
 * not.
 *
 * Two disclosures in Part 2 are the ones a template would never produce, and
 * they are the reason this had to be written by hand:
 *
 *   1. THE DATA LEAVES KENYA. The server is Hetzner fsn1-dc14, Falkenstein,
 *      Germany. Sections 48-50 of the Data Protection Act govern that, and no
 *      previous version of this page mentioned it at all.
 *
 *   2. THE INTERNAL CONTACT LOG EXISTS. portal.models.ContactLogEntry holds
 *      notes about clients that clients never see, deliberately, including
 *      opinions. Opinions about an identifiable person are personal data and a
 *      subject access request reaches them. Saying so is uncomfortable and is
 *      the honest thing; the alternative is a policy that is quietly false the
 *      first time somebody asks for a copy of what we hold.
 *
 * TODO(pre-launch): remove <ReviewNotice /> once an advocate has reviewed this
 * alongside the Terms of Service, the Terms of Business and the DPA — one
 * engagement, per the Policy Pack.
 *
 * TODO(pre-launch): the controller/processor registration position with the
 * Office of the Data Protection Commissioner is still open (Charter 03 §V).
 * This page deliberately makes NO claim about registration in either
 * direction. Do not add one until the position is settled.
 *
 * ── THINGS THAT INVALIDATE SENTENCES ON THIS PAGE ───────────────────────────
 *
 * If journald retention changes, THIS PAGE CHANGES. If the Cloudflare record is
 * ever proxied (orange cloud), two claims in Part 1 become false — Cloudflare
 * would terminate TLS and would see far more than which domain was looked up.
 * The record was briefly proxied on 2026-09-01 and returned to grey the same
 * day; deploy/genmars.caddy carries the same warning where the change would be
 * made. If the server moves, section 12 changes.
 */

const UPDATED = "5 September 2026";
const VERSION = "1.0";

const API_HOST = PORTAL_API_ORIGIN.replace("https://", "");

export default function PrivacyPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <div className={styles.doc}>
            <p className="eyebrow">Legal</p>
            <h1 className={styles.title}>Privacy policy</h1>
            <p className={`lede ${styles.lede}`}>
              This policy is in two parts, because we run two things. The
              website collects almost nothing. The client portal holds real
              information about real work, and most of this document is about
              that.
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
                  {company.domain}, {portal.host}, {API_HOST}
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
            <h2>Who this is about</h2>
            <p>
              {company.legalName} (registration {company.registrationNumber}) of{" "}
              {company.city}, {company.country}, operates the website at{" "}
              {company.domain}, the client portal at {portal.host}, and the
              interface behind it at {API_HOST}.
            </p>
            <p>
              For everything described here, we are the data controller &mdash;
              with one exception, set out in section 15: where a client puts
              personal data about <em>their own</em> customers or staff into a
              system we built or run, they are the controller and we are only
              processing it for them.
            </p>

            {/* ══════════════════ PART ONE ══════════════════ */}

            <div className={styles.part}>
              <p className={styles.partLabel}>Part one</p>
              <h2 className={styles.partTitle}>This website</h2>

              <p>
                Short, because there is very little to say.
              </p>

              <h3>1. What the website collects</h3>
              <p>
                One thing. When you request a page, our server records the
                request in its log:
              </p>
              <ul>
                <li>Your IP address</li>
                <li>The date and time</li>
                <li>The page you asked for, and the response we gave</li>
                <li>
                  Your browser&rsquo;s user-agent string, and the referring page
                  if your browser sent one
                </li>
              </ul>
              <p>
                We use this to keep the site running, to diagnose faults, and to
                investigate abuse. Nothing else. It is kept for{" "}
                <strong>30 days</strong> and then deleted automatically.
              </p>

              <h3>2. What it does not collect</h3>
              <p>This list is longer than the one above, and that is the point.</p>
              <ul>
                <li>
                  <strong>No cookies.</strong> This site sets none. That is why
                  there is no consent banner &mdash; there is nothing to consent
                  to.
                </li>
                <li>
                  <strong>No analytics.</strong> No Google Analytics, no
                  Plausible, no Matomo, no equivalent.
                </li>
                <li>
                  <strong>No tracking pixels, embeds, or advertising.</strong>
                </li>
                <li>
                  <strong>No third-party requests.</strong> Fonts are served from
                  our own server, so your browser does not contact anyone else
                  while loading this site.
                </li>
                <li>
                  <strong>No accounts, and no forms.</strong> Not a contact form,
                  not a newsletter box, not a search field. There is nowhere on{" "}
                  {company.domain} to type anything.
                </li>
              </ul>

              <h3>3. The link to the portal</h3>
              <p>
                Ordering a service is a link, not a submission. It opens{" "}
                <a href={portal.origin}>{portal.host}</a> and carries which
                service and tier you clicked in the address, so the portal can
                show it back to you. That is the only thing that travels, it goes
                to us and to nobody else, and it is a fact about a button rather
                than about you.
              </p>
              <p>
                This website is told nothing about what happens next &mdash; not
                whether you signed up, not whether you finished, not whether you
                came back.
              </p>

              <h3>4. What your browser stores</h3>
              <p>
                This site writes three values to your browser&rsquo;s local
                storage. All three stay on your device, are never transmitted to
                us, and we cannot read them. Clearing your browser&rsquo;s
                storage for this site removes all of them.
              </p>
              <ul>
                <li>
                  <code>gm-theme</code> &mdash; your light or dark theme choice,
                  if you made one.
                </li>
                <li>
                  <code>gm-request-draft</code> &mdash; whatever you have typed
                  into the request form, so that it survives a reload or the trip
                  to the portal and back. Written as you type. You can delete it
                  at any time with the &ldquo;Start again&rdquo; link on that
                  page.
                </li>
                <li>
                  <code>gm-portal-account</code> &mdash; a single yes/no flag
                  recording that you came back from the portal, so the request
                  page does not send you there again. It holds nothing about you:
                  not your name, not your email address, not a session or a
                  token.
                </li>
              </ul>
            </div>

            {/* ══════════════════ PART TWO ══════════════════ */}

            <div className={styles.part}>
              <p className={styles.partLabel}>Part two</p>
              <h2 className={styles.partTitle}>The client portal</h2>

              <p>
                <a href={portal.origin}>{portal.host}</a> runs on different
                software, on a different server, from the website. It is where
                accounts, agreements, invoices and the record of work live. If
                you have never signed in to it, nothing in this part applies to
                you.
              </p>

              <h3>5. What we hold, and why</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>What</th>
                    <th>Why we have it</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Your name and email address, and the organisation you
                      belong to
                    </td>
                    <td>
                      To give you an account, to know which work is yours, and to
                      write to you about it
                    </td>
                  </tr>
                  <tr>
                    <td>Your password</td>
                    <td>
                      Stored only as an Argon2 hash. We cannot read it, recover
                      it, or tell you what it is
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Sign-in records &mdash; when you joined, when you verified
                      your address, failed attempts, whether the account is
                      locked
                    </td>
                    <td>
                      To stop someone guessing their way into your account, and
                      to tell you what happened if they try
                    </td>
                  </tr>
                  <tr>
                    <td>
                      What you told us you need &mdash; the enquiry, the problem
                      you described, what it is costing you today
                    </td>
                    <td>
                      To decide whether we can help, and to scope the work
                      honestly
                    </td>
                  </tr>
                  <tr>
                    <td>
                      The work itself &mdash; orders, scope, statements of work,
                      progress notes, milestones, change requests, support
                      threads
                    </td>
                    <td>
                      It is the record of what was agreed and what was done. It
                      is also the thing that protects you when memories differ
                    </td>
                  </tr>
                  <tr>
                    <td>Invoices, payments and payment references</td>
                    <td>
                      To bill you, to know what is settled, and because Kenyan
                      tax law requires the records
                    </td>
                  </tr>
                  <tr>
                    <td>
                      The phone number used for an M-Pesa prompt, the amount, and
                      what Safaricom told us happened
                    </td>
                    <td>
                      To reconcile payments, and to answer &ldquo;it took the
                      money and said it failed&rdquo; months later
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Your preferred contact person, their phone number, and how
                      they prefer to be reached
                    </td>
                    <td>
                      So that reaching you does not depend on one of us
                      remembering
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Domains and hosting we hold or manage for you, and their
                      renewal dates
                    </td>
                    <td>So that nothing you depend on expires unnoticed</td>
                  </tr>
                  <tr>
                    <td>
                      An activity log &mdash; who did what, and when, on your
                      account and your work
                    </td>
                    <td>
                      So that a change to an invoice, an agreement or an access
                      permission can always be traced to a person and a time
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                We do not use any of it for advertising, we do not sell it, and
                we do not use it to train machine-learning models.
              </p>

              <h3>6. The internal record we keep about working with you</h3>
              <div className={styles.notice} role="note">
                <p className={styles.noticeTitle}>
                  We keep notes you do not see, and you can ask for them.
                </p>
                <p>
                  When we speak to you &mdash; a call, a WhatsApp message, a
                  meeting &mdash; we write down what was said, along with any
                  photographs or files that came out of it. That record is
                  internal. It exists so that an agreement made on a Saturday
                  phone call is not lost, and it is written frankly, which
                  includes impressions and opinions.
                </p>
                <p>
                  We are telling you it exists because it is about you, which
                  means the rights in section 16 reach it: you can ask for a copy
                  of what it says about you, and you can ask us to correct
                  anything factually wrong.
                </p>
              </div>
              <p>
                What we <em>tell</em> you about the work is a progress note,
                which is published, dated and written for you. The internal log
                is a different record with a different purpose, and neither
                pretends to be the other.
              </p>

              <h3>7. Cookies in the portal</h3>
              <p>
                The portal sets two, and only two. Both are strictly necessary to
                sign you in and keep you signed in; there are no analytics or
                advertising cookies, and so there is no consent banner here
                either.
              </p>
              <ul>
                <li>
                  <code>gm_session</code> &mdash; identifies your signed-in
                  session. It cannot be read by JavaScript, is sent only over
                  HTTPS, and lasts up to 14 days or until you sign out.
                </li>
                <li>
                  <code>gm_csrftoken</code> &mdash; protects against another site
                  submitting a form to us as you.
                </li>
              </ul>

              <h3>8. Email we send you</h3>
              <p>
                We send service email about your own work: verification and
                password codes, invitations, invoices, and progress notes. It is
                not marketing, and we do not run a mailing list.
              </p>
              <p>
                Where more than one person at your organisation has an account,
                each of them can turn off progress-note emails without losing
                access to anything &mdash; the second and third person at a
                client usually do not want every note, and having no way to stop
                it is how service email turns into marketing in the
                recipient&rsquo;s mind.
              </p>

              <h3>9. Files you upload</h3>
              <p>
                Files attached to a conversation are stored on the server outside
                the area the web server can reach, and are served only to signed-in
                staff through the application. There is no public link to any of
                them, and no address you could guess.
              </p>

              <h3>10. How long we keep it</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>What</th>
                    <th>How long</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Server logs</td>
                    <td>30 days, then deleted automatically</td>
                  </tr>
                  <tr>
                    <td>Verification and password codes</td>
                    <td>15 minutes, single use, stored hashed</td>
                  </tr>
                  <tr>
                    <td>Spam and deleted email</td>
                    <td>30 days</td>
                  </tr>
                  <tr>
                    <td>An enquiry that does not become work</td>
                    <td>12 months</td>
                  </tr>
                  <tr>
                    <td>
                      A closed account&rsquo;s sign-in details, once access is
                      withdrawn
                    </td>
                    <td>
                      The account is deactivated rather than deleted, so that
                      authorship of notes and approvals is not destroyed; the
                      details go when the organisation&rsquo;s record does
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Correspondence and the record of work, after the work ends
                    </td>
                    <td>7 years</td>
                  </tr>
                  <tr>
                    <td>Invoices, payment records and signed agreements</td>
                    <td>
                      Kept as company records. These are accounting and legal
                      records and are not deleted on request
                    </td>
                  </tr>
                  <tr>
                    <td>Encrypted backups</td>
                    <td>
                      Rolled on a schedule; a deletion works through into backups
                      as they roll rather than immediately
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                The seven-year figure is not us being reluctant to let go: Kenyan
                tax law requires business records to be kept for five years, and
                the period during which a contract claim can be brought is six.
              </p>

              <h3>11. How it is protected</h3>
              <p>
                We list only measures that are in place today, and then we list
                what is not.
              </p>
              <ul>
                <li>
                  Passwords are hashed with Argon2 &mdash; not stored, and not
                  recoverable by us
                </li>
                <li>
                  All traffic is encrypted in transit; plain HTTP is redirected
                  to HTTPS and browsers are instructed to refuse it thereafter
                </li>
                <li>
                  Session cookies are HTTP-only, HTTPS-only, and same-site;
                  cross-site form submission is blocked by token
                </li>
                <li>
                  Repeated failed sign-ins lock the account, and sign-in and
                  request rates are limited
                </li>
                <li>
                  One organisation cannot read another&rsquo;s data. This is
                  enforced in one place in the code, and there are automated
                  tests that fail the build if it stops being true
                </li>
                <li>
                  A reference that is not yours returns &ldquo;not found&rdquo;
                  rather than &ldquo;not allowed&rdquo;, so the system cannot be
                  used to confirm that another client exists
                </li>
                <li>
                  Sensitive actions &mdash; issuing an invoice, signing an
                  agreement, changing who has access &mdash; are written to an
                  append-only log that nothing in the software can edit or delete
                </li>
                <li>
                  Backups are encrypted before they leave the server, with a key
                  we hold and the hosting provider does not
                </li>
                <li>
                  The application runs as an unprivileged user in isolated
                  containers, reachable only through our own proxy; the database
                  is not exposed to the internet
                </li>
              </ul>
              <p>
                <strong>What we do not claim, because it is not true today:</strong>{" "}
                the database is not encrypted at rest on the server&rsquo;s disk
                (the backups are, the live database is not); there is no
                multi-factor authentication yet; we do not run formal periodic
                access reviews; and we publish no support response time. We would
                rather you knew that than read a policy that sounded better than
                the system.
              </p>

              <h3>12. Where your data is, and when it leaves Kenya</h3>
              <div className={styles.notice} role="note">
                <p className={styles.noticeTitle}>
                  Your data is stored in Germany, not in Kenya.
                </p>
                <p>
                  The portal, its database and its backups run on a server in
                  Falkenstein, Germany, rented from Hetzner Online GmbH. Some of
                  the services listed in section 13 also operate outside Kenya.
                  Sections 48 to 50 of the Data Protection Act, 2019 govern
                  transferring personal data out of the country, and we are
                  telling you plainly rather than leaving you to work it out from
                  a provider list.
                </p>
                <p>
                  Germany is subject to the EU General Data Protection Regulation
                  and our contract with the provider carries the data-protection
                  terms that regime requires. If your work has a requirement that
                  data remain in Kenya, tell us before we start &mdash; it is a
                  question about where we build, and it is far cheaper to answer
                  at the beginning.
                </p>
              </div>

              <h3>13. Who else is involved</h3>
              <p>
                Every organisation that can see any part of your data, what they
                do, and where they are. There are no others.
              </p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Who</th>
                    <th>What they do</th>
                    <th>What they can see</th>
                    <th>Where</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hetzner</td>
                    <td>Hosts the servers</td>
                    <td>
                      The infrastructure everything runs on, including the disk
                      the database sits on
                    </td>
                    <td>Germany</td>
                  </tr>
                  <tr>
                    <td>Cloudflare</td>
                    <td>Provides DNS for our domains</td>
                    <td>
                      Which domain was looked up. Not the pages you visit or
                      anything you send
                    </td>
                    <td>Global</td>
                  </tr>
                  <tr>
                    <td>Let&rsquo;s Encrypt</td>
                    <td>Issues our security certificates</td>
                    <td>Our domain names only</td>
                    <td>United States</td>
                  </tr>
                  <tr>
                    <td>Resend</td>
                    <td>Delivers the email the portal sends</td>
                    <td>
                      Your email address and the content of messages we send you
                    </td>
                    <td>United States</td>
                  </tr>
                  <tr>
                    <td>Zoho</td>
                    <td>Hosts our own mailboxes</td>
                    <td>Email correspondence between us and you</td>
                    <td>Outside Kenya</td>
                  </tr>
                  <tr>
                    <td>Safaricom</td>
                    <td>Processes M-Pesa payments</td>
                    <td>
                      The phone number prompted, the amount, and the transaction
                    </td>
                    <td>Kenya</td>
                  </tr>
                </tbody>
              </table>
              <p>
                We will not add anyone to this table without updating this page.
                If a new provider would see personal data belonging to a client,
                we will tell that client before it happens.
              </p>

              <h3>14. Automated decisions</h3>
              <p>
                There are none. Nothing here decides anything about you on its
                own &mdash; not whether to take on your work, not what to charge,
                not whether to extend credit. A person makes those calls, and the
                activity log records which person.
              </p>

              <h3>15. Data you give us about other people</h3>
              <p>
                Where we build or run a system for you and it holds personal data
                about your customers, patients, pupils or staff, that data is
                yours and not ours. You are the data controller; we are a
                processor acting on your instructions. What we may do with it,
                how we protect it, who else touches it, and what happens to it
                when we part company are set out in a separate Data Processing
                Agreement that forms part of your engagement.
              </p>
              <p>
                We do not use client data to improve our own products, and we do
                not move it between clients.
              </p>
            </div>

            {/* ══════════════════ BOTH ══════════════════ */}

            <div className={styles.part}>
              <p className={styles.partLabel}>Both</p>
              <h2 className={styles.partTitle}>Your rights, and reaching us</h2>

              <h3>16. Your rights</h3>
              <p>
                Under the Data Protection Act, 2019 you have the right to be told
                how your data is used, to ask for a copy of it, to have it
                corrected, to have it deleted, to object to how it is being
                processed, and to receive it in a portable form.
              </p>
              <p>
                In practice, what that means depends on which part of this
                document you are in:
              </p>
              <ul>
                <li>
                  <strong>If you only read the website</strong>, the only thing
                  we hold is a server log entry keyed to an IP address, for 30
                  days. To exercise any right over it, tell us the approximate
                  date and time of your visit and the IP address you used &mdash;
                  without those we genuinely cannot find your entries.
                </li>
                <li>
                  <strong>If you have a portal account</strong>, write to us and
                  we will give you everything we hold about you, including the
                  internal record described in section 6. We will not charge you
                  for it, and we will respond within 30 days.
                </li>
              </ul>
              <p>
                Two honest limits on deletion. Records we are legally obliged to
                keep &mdash; issued invoices, signed agreements, payment records
                &mdash; we keep. And a deletion works through into encrypted
                backups as those backups roll, rather than the moment you ask.
              </p>

              <h3>17. If something goes wrong</h3>
              <p>
                If personal data is lost, exposed or taken, we will tell the
                Office of the Data Protection Commissioner within 72 hours of
                becoming aware of it, as the Act requires, and we will tell
                affected people directly where the breach is likely to harm them.
                We will say what happened, what it means for you, and what we are
                doing &mdash; not a notice that avoids saying anything.
              </p>

              <h3>18. How to reach us</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>About</th>
                    <th>Write to</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Your data, or anything on this page</td>
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
                  <tr>
                    <td>Anything else</td>
                    <td>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                If you are not satisfied with our response, you may complain to
                the Office of the Data Protection Commissioner of Kenya. You do
                not have to come to us first, though we would rather you did.
              </p>

              <h3>19. Changes</h3>
              <p>
                If we change what we collect, who we share it with, where it is
                stored, or how long we keep it, we change this page and the date
                and version at the top. Where a change materially affects people
                with portal accounts, we email them. We do not make changes
                quietly.
              </p>
            </div>

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
 * The site carries noindex and a disallow-all robots.txt. This notice stays
 * until an advocate has read the document. Uncomfortable, and honest.
 */
function ReviewNotice() {
  return (
    <aside className={styles.notice} role="note">
      <p className={styles.noticeTitle}>This document is still in draft.</p>
      <p>
        Everything stated here is accurate &mdash; it was written from a record
        of what our systems actually do, not from a template, and section 11
        lists what we deliberately do not claim. It has not yet been reviewed by
        an advocate, and this notice stays until it has.
      </p>
    </aside>
  );
}
