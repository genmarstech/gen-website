import Link from "next/link";
import { company, contact, liveSocials, platform } from "@/lib/company";
import { portal } from "@/lib/portal";
import { Mark } from "./Brand";
import styles from "./SiteFooter.module.css";

/**
 * Charter 03 §IV Tier 1 requires the privacy policy and terms of service to be
 * linked in the footer of every page. Those routes exist but are not yet
 * publishable — see src/app/privacy/page.tsx.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={`band-invert ${styles.footer}`}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Mark size={36} />
            <p className={styles.tagline}>{company.tagline}</p>
          </div>

          <div className={styles.cols}>
            <div>
              <h2 className={styles.colTitle}>Company</h2>
              <ul className={styles.list}>
                <li>
                  <Link href="/services/">Services</Link>
                </li>
                <li>
                  <Link href="/docs/">Documentation</Link>
                </li>
                <li>
                  <Link href="/approach/">Approach</Link>
                </li>
                <li>
                  <Link href="/contact/">Contact</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={styles.colTitle}>Legal</h2>
              <ul className={styles.list}>
                <li>
                  <Link href="/privacy/">Privacy policy</Link>
                </li>
                <li>
                  <Link href="/terms/">Terms of service</Link>
                </li>
              </ul>
            </div>

            <div>
              {/*
                ── OURS, AND SEPARATE. THE COLUMN HAS TO SAY BOTH ───────────
                Genmars built and runs the Business Platform, so it belongs
                here beside the portal rather than reading as a third party's
                product. But it is a different application on a different host
                with its own database: using it as a till does not make a shop
                a consulting client, and nothing about that shop's staff or
                takings reaches the rest of the company.

                A column that only said "ours" would imply the portal account
                and the till are one system. One that only said "separate"
                would read as a link to somebody else. The line under the
                heading is what carries the difference.

                A plain anchor, not next/link — a different host, and this is
                a static export that cannot route off its own origin.
              */}
              <h2 className={styles.colTitle}>Solutions</h2>
              <ul className={styles.list}>
                <li>
                  <a href={platform.origin}>{platform.name}</a>
                </li>
                <li className={styles.plain}>{platform.host}</li>
                <li className={styles.plain}>
                  A point of sale that runs on its own. Built and run by
                  Genmars; it needs no portal account, and a shop&rsquo;s own
                  staff and takings stay inside it.
                </li>
                <li>
                  <Link href="/services/#business-platform">
                    What it costs
                  </Link>
                </li>
                <li>
                  <Link href="/docs/business-platform/">How it works</Link>
                </li>
              </ul>
            </div>

            <div>
              {/* The portal is a different host, so a plain anchor — next/link
                  routes within this export and cannot leave it. */}
              <h2 className={styles.colTitle}>Clients</h2>
              <ul className={styles.list}>
                <li>
                  <a href={portal.signIn}>Sign in to the portal</a>
                </li>
                <li className={styles.plain}>{portal.host}</li>
              </ul>
            </div>

            <div>
              <h2 className={styles.colTitle}>Reach us</h2>
              <ul className={styles.list}>
                <li>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
                <li className={styles.plain}>
                  {company.city}, {company.country}
                </li>
              </ul>

              {/*
                Only the accounts that are ready — see `socials` in company.ts.
                A footer link to a login wall or a dead profile is a small
                broken promise on the surface a stranger uses to decide whether
                we are real, and Charter 04 §IV applies to it.

                Text, not icons. A row of unlabelled glyphs makes a reader
                guess which is which, and the handle is what somebody types
                into a search box when a link fails them.
              */}
              {liveSocials.length > 0 ? (
                <ul className={`${styles.list} ${styles.socials}`}>
                  {liveSocials.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.url}
                        // noopener because these open in a new tab, and
                        // noreferrer so a social network is not told which
                        // page of ours somebody left from.
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.label}
                        <span className={styles.handle}>{social.handle}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          {/* The name, without the registration number. It appeared on every
              page of the site and earned nothing there — a visitor deciding
              whether to work with us is not checking a BN against a registry.
              It stays where it is actually load-bearing: the privacy policy,
              which has to identify the data controller, and every document
              that goes out. */}
          <p>{company.legalName}</p>
          <p>&copy; {year}</p>
        </div>
      </div>
    </footer>
  );
}
