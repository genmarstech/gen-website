import type { Metadata } from "next";
import Link from "next/link";
import { offers, pricingNote } from "@/lib/company";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /services and /services/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/services/" },
  title: "Services and pricing",
  description:
    "Implementation, custom development, managed services, security readiness, advisory, compliance and training — with starting prices. Plus the Genmars Business Platform, in development.",
};

/**
 * The service catalogue.
 *
 * ── THE PAGE IS SPLIT IN TWO, AND THE SPLIT IS THE POINT ────────────────────
 *
 * Everything under "Available now" can be bought today. Everything under "In
 * development" cannot. Charter 04 §IV — nothing untrue on a Genmars surface —
 * makes that distinction the most important thing on the page, so it is a
 * heading rather than a footnote, and the second group carries a label on every
 * card instead of relying on the reader having noticed the heading.
 *
 * The alternative was to leave the platform off entirely. That would be honest
 * but useless: it is what the company is FOR, and a prospect deciding whether
 * to start a relationship deserves to know where it is going.
 */
export default function ServicesPage() {
  const now = offers.filter((o) => o.available === "now");
  const building = offers.filter((o) => o.available === "building");

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
              We are building a product company with a services layer, not a
              general-purpose software agency. That means a reusable platform
              underneath, and the implementation, integration and support work
              that makes it actually run in your organisation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- available now ---------- */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <h2 className={styles.groupTitle}>Available now</h2>
            <p className={styles.groupNote}>{pricingNote}</p>
          </Reveal>

          <div className={styles.offers}>
            {now.map((offer, i) => (
              <Offer key={offer.slug} offer={offer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- in development ---------- */}
      <section className={`section ${styles.building}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2 className={styles.groupTitle}>In development</h2>
            <p className={styles.groupNote}>
              This is where the company is going, and the prices are what we
              intend to charge. You cannot sign up for either one today. If
              your timeline is longer than a few months, it is worth a
              conversation now &mdash; early clients shape what gets built
              first.
            </p>
          </Reveal>

          <div className={styles.offers}>
            {building.map((offer, i) => (
              <Offer key={offer.slug} offer={offer} index={now.length + i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- on price ---------- */}
      <section className={`section ${styles.pricing}`}>
        <div className="wrap">
          <Reveal className="measure">
            <p className="eyebrow">On price</p>
            <h2 className={styles.pricingTitle}>
              Every number here is a starting point.
            </h2>
            <p className={styles.pricingBody}>
              They are real: the entry tier of each service costs what it says.
              What they are not is a quote. Scope moves the figure, and the
              enterprise tiers deliberately have no published ceiling because
              pretending otherwise would mean quoting work nobody has looked at
              yet.
            </p>
            <p className={styles.pricingBody}>
              In a first conversation we will tell you which tier your problem
              lands in, and say plainly if it is larger than what you have set
              aside. Neither of us benefits from a proposal that was never
              going to be affordable.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Not sure which of these you need?</h2>
            <p className="lede">
              Most people are not, and that is fine. Describe the problem and we
              will tell you whether it is an assessment, an implementation, or
              something we can quote directly.
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

function Offer({
  offer,
  index,
}: {
  offer: (typeof offers)[number];
  index: number;
}) {
  return (
    <Reveal as="article" delay={(index % 4) * 60} className={styles.offer}>
      <div className={styles.offerAside}>
        <span className={styles.offerNum}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* The price sits beside the number rather than inside the prose, so a
            reader scanning for cost finds it in the same place every time. */}
        <span className={styles.offerPrice}>
          <span className={styles.offerFrom}>from</span>
          {offer.from}
          <span className={styles.offerUnit}>{offer.unit}</span>
        </span>
      </div>

      <div className={styles.offerBody} id={offer.slug}>
        <h3 className={styles.offerName}>
          {offer.name}
          {/* Repeated per card on purpose. The section heading is easy to
              scroll past, and this is the one fact that must not be missed. */}
          {offer.available === "building" ? (
            <span className={styles.badge}>In development</span>
          ) : null}
        </h3>
        <hr className="rule--accent" />
        <p className={styles.offerLead}>{offer.lead}</p>
        <p className={styles.offerText}>{offer.body}</p>

        {"note" in offer && offer.note ? (
          <p className={styles.offerNote}>{offer.note}</p>
        ) : null}

        <p className={styles.offerFor}>
          <span className={styles.offerForLabel}>Worth a conversation if</span>
          {offer.forYouIf}
        </p>
      </div>
    </Reveal>
  );
}
