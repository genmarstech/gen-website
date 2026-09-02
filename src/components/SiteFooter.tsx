import Link from "next/link";
import { company, contact } from "@/lib/company";
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
