import type { Metadata } from "next";
import { company, contact } from "@/lib/company";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /contact and /contact/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/contact/" },
  title: "Contact",
  description:
    "How to reach Genmars Tech. Nairobi, Kenya. Tell us the problem, what it costs you each month, and when it started.",
};

/**
 * Contact.
 *
 * NO CONTACT FORM, deliberately. Two reasons:
 *
 *   1. This is a static export with no backend, so a form would need a
 *      third-party handler. That means routing prospects' personal data through
 *      a processor we have no written processing agreement with — Charter 03 §V
 *      requires one for every engagement involving personal data, and adopting
 *      a new service casually is exactly what Charter 03 §I forbids.
 *   2. A form that quietly fails is worse than no form. mailto opens the
 *      visitor's own client, and they keep a copy of what they sent.
 *
 * If a form is wanted later, it needs a backend on our own infrastructure and a
 * privacy policy that describes it accurately.
 */

const whatToInclude = [
  {
    q: "What is happening today that made you look for this now?",
    why: "A specific trigger tells us more than a feature list. Something broke, someone left, a deadline moved.",
  },
  {
    q: "What does the problem cost you per month?",
    why: "Hours, shillings, or lost customers — a rough figure is fine. If it costs nothing, it can usually wait, and we will say so.",
  },
  {
    q: "Who else has to agree before this goes ahead?",
    why: "Not a screening question. It saves you from relaying technical detail second-hand.",
  },
  {
    q: "When does this need to be working?",
    why: "If the date is not achievable with the team we have, we would rather tell you in week one than in month three.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">Contact</p>
          <h1 className={styles.title}>Tell us what is going wrong.</h1>
          <p className="lede measure">
            The most useful first message is not a brief or a specification. It
            is the problem in plain words, what it costs you, and when it
            started.
          </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={styles.grid}>
            <Reveal className={styles.details}>
              <h2 className={styles.detailsTitle}>Reach us</h2>
              <hr className="rule--accent" />

              <dl className={styles.dl}>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </dd>
                </div>

                <div>
                  <dt>Where we are</dt>
                  <dd>
                    {company.city}, {company.country}
                    <span className={styles.sub}>
                      Remote team. We meet clients in Nairobi by arrangement.
                    </span>
                  </dd>
                </div>

                <div>
                  <dt>Registered as</dt>
                  <dd>{company.legalName}</dd>
                </div>
              </dl>

              {/*
                No response-time commitment. Charter 03 §IV Tier 2 — a support
                channel with a stated response time — is not in place yet, and
                the standing rule forbids advertising one before it is tested.
              */}
              <p className={styles.note}>
                We read everything that arrives. We have not published a
                guaranteed response time because we do not yet have a support
                channel that has been tested against one — and we would rather
                leave it unstated than miss a number we printed on a website.
              </p>
            </Reveal>

            <Reveal delay={130} className={styles.include}>
              <h2 className={styles.detailsTitle}>What to put in the email</h2>
              <hr className="rule--accent" />
              <p className={styles.includeLede}>
                None of this is required. It just means the first reply is useful
                instead of a list of questions.
              </p>

              <ol className={styles.questions}>
                {whatToInclude.map((item) => (
                  <li key={item.q}>
                    <p className={styles.q}>{item.q}</p>
                    <p className={styles.why}>{item.why}</p>
                  </li>
                ))}
              </ol>

              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(
                  "Project enquiry",
                )}`}
                className={`btn ${styles.mailBtn}`}
              >
                Email {contact.email}
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`section ${styles.expect}`}>
        <div className="wrap">
          <Reveal className="measure">
            <p className="eyebrow">What happens next</p>
            <h2 className={styles.expectTitle}>
              We will tell you early if this is not a fit.
            </h2>
            <p className={styles.expectBody}>
              If your project is larger than we can deliver well, or the
              timeline is not real, or the budget and the scope do not meet, you
              will hear that in the first or second conversation — not after a
              month of proposal writing.
            </p>
            <p className={styles.expectBody}>
              That is not us being difficult. Selling beyond our capacity does
              not create revenue; it creates missed deadlines and a reputation
              that takes years to rebuild.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
