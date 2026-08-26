import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestBuilder } from "@/components/RequestBuilder";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Request work",
  description:
    "Tell Genmars Tech what you need. Four questions, and the page composes the email for you — nothing is submitted to us or to anyone else.",
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
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Suspense fallback={null}>
            <RequestBuilder />
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
