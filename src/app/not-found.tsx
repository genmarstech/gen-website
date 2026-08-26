import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section
      className="section section--flush"
      style={{ paddingBlock: "clamp(4rem, 12vw, 10rem)" }}
    >
      <div className="wrap">
        <div className="measure">
          <p className="eyebrow">404</p>
          <h1 style={{ marginBottom: "var(--sp-6)" }}>
            That page is not here.
          </h1>
          <p className="lede" style={{ marginBottom: "var(--sp-8)" }}>
            Either it moved or it never existed. Both are our fault rather than
            yours.
          </p>
          <Link href="/" className="btn">
            Back to the start
          </Link>
        </div>
      </div>
    </section>
  );
}
