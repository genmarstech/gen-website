import type { Metadata } from "next";
import Link from "next/link";
import { offers } from "@/lib/company";
import { Reveal } from "@/components/Reveal";
import { ReconciliationMark } from "@/components/Illustration";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Paid discovery, custom build, payments and reconciliation, and maintenance retainers. What Genmars Tech sells, and how each engagement works.",
};

/**
 * Services.
 *
 * NO PRICES ON THIS PAGE. The price bands in the Commercial Playbook (§2) are
 * deliberately blank — pricing is an open decision and the pricing floor is the
 * founder's sole call (Charter 02 §I). Publishing a number we have not settled
 * would breach Charter 04 §IV and negotiate against ourselves in public.
 *
 * "Talk to us about budget" is the honest answer until the Financial Operating
 * Model's Retainer Tiers tab is filled in.
 */
export default function ServicesPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
          <p className="eyebrow">Services</p>
          <h1 className={styles.title}>
            Businesses do not buy software.
            <br />
            They buy an outcome they cannot currently get.
          </h1>
          <p className="lede measure">
            Four offers. Everything we sell is one of these or a combination of
            them. If what you need sits outside the list, it goes to the founder
            before anyone quotes you a thing.
          </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={styles.offers}>
            {offers.map((offer, i) => (
              <Reveal
                as="article"
                key={offer.slug}
                delay={i * 60}
                className={styles.offer}
              >
                <div className={styles.offerAside}>
                  <span className={styles.offerNum}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className={styles.offerBody} id={offer.slug}>
                  <h2 className={styles.offerName}>{offer.name}</h2>
                  <hr className="rule--accent" />
                  <p className={styles.offerLead}>{offer.lead}</p>
                  <p className={styles.offerText}>{offer.body}</p>

                  {offer.slug === "payments" ? (
                    <div className={styles.offerArt}>
                      <ReconciliationMark />
                    </div>
                  ) : null}

                  {"note" in offer && offer.note ? (
                    <p className={styles.offerNote}>{offer.note}</p>
                  ) : null}

                  <p className={styles.offerFor}>
                    <span className={styles.offerForLabel}>
                      Worth a conversation if
                    </span>
                    {offer.forYouIf}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — handled honestly rather than avoided. */}
      <section className={`section ${styles.pricing}`}>
        <div className="wrap">
          <Reveal className="measure">
            <p className="eyebrow">On price</p>
            <h2 className={styles.pricingTitle}>
              There are no prices on this page.
            </h2>
            <p className={styles.pricingBody}>
              Not because they are hidden, and not as a negotiating tactic. Fixed
              price bands are one of the decisions this company has not finished
              making, and publishing a number we have not settled would be a
              worse answer than saying so.
            </p>
            <p className={styles.pricingBody}>
              What we will do in a first conversation is tell you the range your
              problem usually lands in, and say plainly if it is larger than what
              you have set aside. Neither of us benefits from a proposal that was
              never going to be affordable.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Not sure which of these you need?</h2>
            <p className="lede">
              That is usually what paid discovery is for. Describe the problem
              and we will tell you whether it is a discovery job or something we
              can quote directly.
            </p>
            <div className={styles.actions}>
              <Link href="/contact/" className="btn">
                Describe your problem
              </Link>
              <Link href="/approach/" className="btn btn--ghost">
                How we build
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
