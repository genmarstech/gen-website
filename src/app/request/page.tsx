import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RequestBuilder } from "@/components/RequestBuilder";
import { RequestGate } from "@/components/RequestGate";
import { Reveal } from "@/components/Reveal";
import { portal } from "@/lib/portal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  /* Absolute canonical, resolved against metadataBase in layout.tsx.
     Without one, /request and /request/ and www. and non-www are four URLs
     for one page as far as a crawler is concerned. */
  alternates: { canonical: "/request/" },
  title: "Request work",
  description:
    "Tell Genmars Tech what you need. Set up your client account, then four questions — and the page composes the email for you.",
};

export default function RequestPage() {
  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Request work</p>
            <h1 className={styles.title}>Ask us for something specific.</h1>
            <p className="lede measure">
              Four questions. They are the ones we would ask on a first call
              anyway, and answering them here means the first reply you get is
              useful instead of a list of questions back.
            </p>
            {/*
              Read by two audiences and written for both: someone waiting the
              moment before the browser leaves for the portal, and someone back
              from it with the form in front of them. So it says what the
              account is FOR rather than announcing a step — the step either
              has not happened yet or is already done.
            */}
            <p className="measure">
              Your answers land against your account on{" "}
              <a href={portal.origin}>{portal.host}</a>, which is where the
              engagement lives once it starts &mdash; scope, weekly progress
              notes, milestones and payments, in one place instead of scattered
              through an email thread.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Suspense fallback={null}>
            <RequestGate>
              <RequestBuilder />
            </RequestGate>
          </Suspense>
        </div>
      </section>

      <section className={`section ${styles.privacy}`}>
        <div className="wrap">
          <Reveal className="measure">
            <p className="eyebrow">Where this goes</p>
            <h2 className={styles.privacyTitle}>
              Nothing on this page is submitted anywhere.
            </h2>
            <p className={styles.privacyBody}>
              There is no form handler behind it. What you type stays in your
              browser, and the button opens your own email client with the
              message already written. We receive it the same way we would
              receive any other email — and you keep a copy in your Sent folder.
            </p>
            <p className={styles.privacyBody}>
              We built it this way on purpose. A third-party form service would
              mean routing your details through a company we have no data
              processing agreement with, and our engineering charter does not
              allow adopting one casually. This does the same job with nobody
              in the middle.
            </p>
            <p className={styles.privacyBody}>
              The account step is the one part that is different, and it is
              worth being precise about. What you type into{" "}
              <a href={portal.origin}>{portal.host}</a> is submitted &mdash; to
              us, on our own server, under the portal&rsquo;s own policy. What
              you type into the form on this page is not, and the portal is
              never told about it. The two are separate systems on separate
              domains, which is the whole reason this site can hold nothing
              about you at all. Our{" "}
              <Link href="/privacy/">privacy policy</Link> sets out both.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
