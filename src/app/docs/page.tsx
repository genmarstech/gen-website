import Link from "next/link";
import type { Metadata } from "next";
import { company, socials } from "@/lib/company";
import { docsByCategory, loadDocs } from "@/lib/docs";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/docs/" },
  title: "Documentation",
  description:
    "Documentation for the software Genmars Tech builds — what each system does, where the work has got to, and the source where it is public.",
};

/**
 * The documentation index.
 *
 * ── WHY THIS PAGE EXISTS ────────────────────────────────────────────────────
 *
 * A Stage 0 company has no case studies, so the credible thing it can show is
 * the work itself: what has been built, how far along it is, and the source.
 * /approach/ states the standard we hold ourselves to; this shows what came
 * out of it, and links to code somebody can check rather than believe.
 *
 * ── THE STATE OF EACH THING IS ON THE CARD, NOT BURIED ──────────────────────
 *
 * /services/ already tells a visitor the Business Platform is IN DEVELOPMENT
 * and stops there, which leaves a prospect unable to tell a project starting
 * next quarter from one in beta with clients on it. The badge and the team's
 * note answer that, and the note carries the month it was written — a progress
 * claim with no date is the kind that quietly stops being true.
 */
export default async function DocsIndex() {
  const groups = await docsByCategory();
  const { statuses } = await loadDocs();
  const label = (key: string) =>
    statuses.find((s) => s.key === key)?.label ?? key;

  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Documentation</p>
            <h1 className={styles.title}>What we have built, and where it is.</h1>
            <p className="lede measure">
              Documentation for the software {company.formalName} builds. Each
              page says what the system does, how far the work has actually
              got, and where the source is when the repository is public.
            </p>
          </Reveal>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.key} className="section">
          <div className="wrap">
            <h2 className={styles.groupTitle}>{group.label}</h2>
            <div className={styles.grid}>
              {group.docs.map((doc, i) => (
                <Reveal as="article" key={doc.slug} delay={i * 70}>
                  <Link href={`/docs/${doc.slug}/`} className={styles.card}>
                    <span className={styles.cardHead}>
                      <span className={styles.cardTitle}>{doc.title}</span>
                      <span
                        className={`${styles.badge} ${
                          styles[`badge_${doc.status}`] ?? ""
                        }`}
                      >
                        {label(doc.status)}
                      </span>
                    </span>
                    <span className={styles.cardSummary}>{doc.summary}</span>
                    {doc.status_note && (
                      <span className={styles.cardNote}>
                        {doc.status_note}
                        {doc.status_changed_at && (
                          <span className={styles.cardNoteDate}>
                            {" — "}
                            {new Date(doc.status_changed_at).toLocaleDateString(
                              "en-KE",
                              { month: "long", year: "numeric" },
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/*
        The source, offered once and plainly. For a company whose proof is the
        work rather than a client list, "here is the code" carries more than
        another paragraph claiming quality would.
      */}
      <section className="section section--band">
        <div className="wrap">
          <Reveal className={styles.source}>
            <h2 className={styles.groupTitle}>The source</h2>
            <p className="measure">
              Most of what is described here is public. The client portal, the
              business platform and this website are all open on GitHub — read
              them, or take what is useful.
            </p>
            <a
              className="btn"
              href={socials.github.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {socials.github.handle} on GitHub
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
