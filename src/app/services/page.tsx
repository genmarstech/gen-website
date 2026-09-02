import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { offers, pricingNote } from "@/lib/company";
import { orderUrl } from "@/lib/portal";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /services and /services/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/services/" },
  title: "Services and pricing",
  description:
    "Implementation, custom development, managed services, security readiness, advisory, compliance and training — three tiers each, with prices. Plus the Genmars Business Platform, in development.",
};

/**
 * The catalogue, and the only way to order anything.
 *
 * ── THIS PAGE REPLACED /request/ ────────────────────────────────────────────
 *
 * There used to be a separate "request work" page with a free-text form that
 * composed an email. It has been removed. Two routes to the same conversation
 * meant two places to keep in step, and the mailto one produced a request
 * nobody could attribute to an offering — the commercial partners opened it
 * with no idea which of the seven services it was about.
 *
 * Every tier below now carries its own order link, and the tier travels with
 * the visitor into the portal (lib/portal.ts, orderUrl). Someone who does not
 * know what they need is still served: "Not sure which of these" at the foot
 * files the same enquiry with no service attached, which the backend treats as
 * an ordinary state rather than a gap.
 *
 * ── ORDERING IS AN ENQUIRY ──────────────────────────────────────────────────
 *
 * Nothing here charges anyone or commits either side. Charter 02 §I keeps
 * qualification with the commercial partners and the capacity veto with the
 * founder, so the copy on every button says "order" and the copy around it
 * says what that actually starts.
 *
 * ── THE now/building SPLIT ──────────────────────────────────────────────────
 *
 * Charter 04 §IV. The platform tiers are priced and shown because that is
 * where the company is going, and labelled on every card because a section
 * heading is easy to scroll past. Their buttons ask about early access rather
 * than claiming a subscription that cannot be bought.
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
              Pick the tier that fits.
              <br />
              We will tell you if it is the wrong one.
            </h1>
            <p className="lede measure">
              Everything we sell is here, with what it costs. Ordering opens
              your client account and files the request against it &mdash; it
              does not charge you, and it does not start work. That begins when
              scope is agreed and a statement of work is signed.
            </p>
          </Reveal>
        </div>
      </section>

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

      {/*
        Between what can be bought today and what is still being built. The
        photograph illustrates the work; it is not our workroom, and the alt
        text does not suggest it is.
      */}
      <div className={styles.bandFigure}>
        <Photo
          name="workroom"
          alt="An empty workroom: desks, monitors and chairs under daylight."
          sizes="100vw"
        />
      </div>

      <section className={`section ${styles.building}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2 className={styles.groupTitle}>In development</h2>
            <p className={styles.groupNote}>
              This is where the company is going, and the prices are what we
              intend to charge. You cannot subscribe to either one today. If
              your timeline runs past a few months it is worth talking now
              &mdash; early clients shape what gets built first.
            </p>
          </Reveal>

          <div className={styles.offers}>
            {building.map((offer, i) => (
              <Offer key={offer.slug} offer={offer} index={now.length + i} />
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.pricing}`}>
        <div className="wrap">
          <Reveal className="measure">
            <p className="eyebrow">On price</p>
            <h2 className={styles.pricingTitle}>
              The entry tier costs what it says.
            </h2>
            <p className={styles.pricingBody}>
              Above it, scope moves the figure. The top tier of each service is
              shown with a <strong>+</strong> because it deliberately has no
              published ceiling &mdash; quoting one would mean pricing work
              nobody has looked at yet.
            </p>
            <p className={styles.pricingBody}>
              In a first conversation we will tell you which tier your problem
              actually lands in, including when that is a cheaper one than you
              clicked. We will also say plainly if it is larger than what you
              have set aside, because neither of us benefits from a proposal
              that was never going to be affordable.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Not sure which of these you need?</h2>
            <p className="lede">
              Most people are not, and picking wrong costs you nothing here.
              Describe the problem instead and we will tell you which tier it
              lands in &mdash; or that it is none of them.
            </p>
            <div className={styles.actions}>
              <a href={orderUrl()} className="btn">
                Describe your problem
              </a>
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
  const building = offer.available === "building";

  return (
    <Reveal as="article" delay={(index % 3) * 60} className={styles.offer}>
      <div className={styles.offerHead}>
        <span className={styles.offerNum}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* The anchor sits on the heading, which is what a deep link from the
            command palette should actually scroll to. */}
        <h3 className={styles.offerName} id={offer.slug}>
          {offer.name}
          {/* Repeated per card. The section heading above is easy to scroll
              past, and this is the one fact that must not be missed. */}
          {building ? <span className={styles.badge}>In development</span> : null}
        </h3>
        <p className={styles.offerLead}>{offer.lead}</p>
      </div>

      <div className={styles.tiers}>
        {offer.tiers.map((tier) => (
          <div key={tier.slug} className={styles.tier}>
            <div className={styles.tierHead}>
              <h4 className={styles.tierName}>{tier.name}</h4>
              <p className={styles.tierPrice}>
                {tier.price}
                {/* No published ceiling, said with a mark rather than a
                    footnote — the "+" is doing real work here. */}
                {"open" in tier && tier.open ? (
                  <span className={styles.plus} aria-label="and up">
                    +
                  </span>
                ) : null}
                <span className={styles.tierUnit}>{offer.unit}</span>
              </p>
            </div>

            <p className={styles.tierLead}>{tier.lead}</p>

            <ul className={styles.includes}>
              {tier.includes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <a
              href={orderUrl(offer.slug, tier.name)}
              className={building ? styles.askButton : styles.orderButton}
            >
              {building ? "Ask about early access" : `Order ${tier.name}`}
              <span className={styles.srOnly}> &mdash; {offer.name}</span>
            </a>
          </div>
        ))}
      </div>

      <div className={styles.offerBody}>
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
