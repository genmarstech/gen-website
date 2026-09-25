import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { API_ORIGIN, loadProductsOrEmpty } from "@/lib/work";
import { LiveProducts } from "./LiveProducts";
import styles from "./page.module.css";

/**
 * Products.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * SPLIT OUT OF /work BECAUSE THEY ANSWER DIFFERENT QUESTIONS.
 *
 * A portfolio answers "can you build something like this". A product answers
 * "can I buy this". Both used to live on /work, so a visitor who wanted the
 * second had to infer it from a list that also contained research notes and
 * concepts — and the one thing Genmars actually sells sat between them.
 *
 * The split is a filter, not a second model: `label` already distinguished a
 * Genmars product from everything else, and both pages read one table through
 * one consent gate. See WorkPublished in gen-portal.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── SAME BUILD-THEN-REFRESH AS /work ──────────────────────────────────────
 * Fetched at build time so real HTML ships — what a crawler reads and what
 * renders with JavaScript off — then re-read in the browser so publishing in
 * operations appears on the next page load rather than the next deploy.
 */

export const metadata: Metadata = {
  alternates: { canonical: "/products/" },
  title: "Products",
  description:
    "Software Genmars Tech owns and runs, sold to businesses in Kenya and across East Africa.",
};

export default async function ProductsPage() {
  const payload = await loadProductsOrEmpty();

  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Products</p>
            <h1 className={styles.title}>Software we own and run.</h1>
            {/*
              States what a product IS here, because the distinction is the
              reason this page exists. It must not imply a catalogue we do not
              have — Charter 04 §IV — so it says what is true of the ones
              listed rather than promising a range.
            */}
            <p className="lede measure">
              Not client work. These are systems Genmars built, hosts and
              maintains, sold to businesses that need them rather than
              commissioned by one.
            </p>
          </Reveal>
        </div>
      </section>

      <LiveProducts initial={payload} origin={API_ORIGIN} />

      <section className={`section ${styles.cta}`}>
        <div className="wrap">
          <Reveal className="measure">
            <h2>Want it for your business?</h2>
            <p className="lede">
              Tell us how you work today and we will say plainly whether this
              fits. If it does not, we will say that too.
            </p>
            <div className={styles.holdingActions}>
              <Link href="/services/" className="btn">
                Talk to us
              </Link>
              <Link href="/work/" className="btn btn--ghost">
                See our client work
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
