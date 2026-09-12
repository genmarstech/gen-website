import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docBySlug, loadDocs, statusLabel } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { Reveal } from "@/components/Reveal";
import styles from "./page.module.css";

/**
 * One document.
 *
 * Every published slug becomes a file at build time. There is no server, so a
 * document that is not in generateStaticParams simply does not exist as a
 * page — which is why withdrawing one in operations and deploying is a real
 * removal rather than a hidden page somebody can still reach by guessing.
 */
export async function generateStaticParams() {
  const { docs } = await loadDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await docBySlug(slug);
  if (!doc) return {};

  return {
    alternates: { canonical: `/docs/${doc.slug}/` },
    title: doc.title,
    // The summary, which the author wrote as the promise made to somebody who
    // has not clicked yet. Not the first paragraph of the body, which is
    // usually context rather than an answer.
    description: doc.summary,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await docBySlug(slug);
  if (!doc) notFound();

  const status = await statusLabel(doc.status);
  const confirmed = doc.status_changed_at
    ? new Date(doc.status_changed_at)
    : null;

  return (
    <>
      <section className={`section section--flush ${styles.head}`}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">
              <Link href="/docs/" className={styles.back}>
                Documentation
              </Link>
            </p>
            <h1 className={styles.title}>{doc.title}</h1>
            <p className="lede measure">{doc.summary}</p>

            <div className={styles.meta}>
              <span
                className={`${styles.badge} ${styles[`badge_${doc.status}`] ?? ""}`}
              >
                {status}
              </span>
              {doc.repo_url && (
                <a
                  className={styles.repo}
                  href={doc.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source on GitHub
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              )}
            </div>

            {/*
              The team's own account of where this is, with the date it was
              written. The date is not decoration: a progress note without one
              implies somebody checked this morning, and Charter 04 §IV has no
              exception for a claim that used to be true.
            */}
            {doc.status_note && (
              <p className={styles.note}>
                {doc.status_note}
                {confirmed && (
                  <span className={styles.noteDate}>
                    {" — from the team, "}
                    <time dateTime={confirmed.toISOString()}>
                      {confirmed.toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </span>
                )}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <article className={styles.body}>{renderMarkdown(doc.body)}</article>
        </div>
      </section>
    </>
  );
}
