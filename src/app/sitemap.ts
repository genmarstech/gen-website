import type { MetadataRoute } from "next";
import { company } from "@/lib/company";
import { loadProductsOrEmpty, loadWorkOrEmpty } from "@/lib/work";
import { loadDocs } from "@/lib/docs";

/**
 * sitemap.xml
 *
 * LIVE as of 2026-09-05, when robots.ts stopped disallowing everything.
 *
 * ── WHAT IS OMITTED, AND WHY ────────────────────────────────────────────────
 *
 * `/privacy/` and `/terms/` were omitted while they were placeholders, because
 * a policy page in Google's index saying "not yet published" is worse than no
 * policy page in it. Both now carry real, verified text, so both are listed —
 * at low priority, because they are documents people look up rather than pages
 * worth ranking for.
 *
 * `/request/` — REMOVED, not merely unlisted. Ordering now happens per tier on
 * `/services/`, which is listed and is the page worth ranking: it carries the
 * catalogue, the tiers and the prices. Caddy 301s the old path there so the
 * links already in the world, and anything Google has indexed, land somewhere
 * that answers the same question.
 *
 * ── WHY lastModified IS A CONSTANT ──────────────────────────────────────────
 *
 * It was `new Date()`, which is the moment of the BUILD. Every deploy — a typo
 * fix, a dependency bump, this file — then told Google that every page on the
 * site had changed. lastmod that always changes carries no information, and
 * Google's documented response is to stop trusting it.
 *
 * So it is a date a human sets when the CONTENT actually changes. Stale is
 * survivable; wrong on every build is not.
 */
/** Required by `output: "export"` — these are emitted at build time. */
export const dynamic = "force-static";

/** Bump when page copy meaningfully changes. Not on every deploy. */
const CONTENT_REVIEWED = "2026-09-05";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { work } = await loadWorkOrEmpty();
  const { work: products } = await loadProductsOrEmpty();

  const lastModified = CONTENT_REVIEWED;

  /*
   * ── DOCUMENTATION IS LISTED FROM THE SAME SOURCE THAT RENDERS IT ──────────
   *
   * Not a hand-kept list. A document withdrawn in operations disappears from
   * generateStaticParams and from here in the same build, so the sitemap
   * cannot end up advertising a page that 404s — which is the failure that
   * makes Google distrust a sitemap generally, not just the dead entry.
   *
   * `updated_at` is the document's own, unlike the constant below: these
   * change when somebody edits them rather than when the site is redeployed,
   * so the date is real information here.
   */
  const { docs } = await loadDocs();
  const documentation: MetadataRoute.Sitemap = docs.length
    ? [
        {
          url: `${company.url}/docs/`,
          lastModified,
          priority: 0.7,
          changeFrequency: "monthly" as const,
        },
        ...docs.map((doc) => ({
          url: `${company.url}/docs/${doc.slug}/`,
          lastModified: doc.updated_at.slice(0, 10),
          priority: 0.6,
          changeFrequency: "monthly" as const,
        })),
      ]
    : [];

  return [
    { url: `${company.url}/`, lastModified, priority: 1, changeFrequency: "monthly" },
    { url: `${company.url}/services/`, lastModified, priority: 0.9, changeFrequency: "monthly" },
    /*
     * ── /work/ IS LISTED ONLY WHILE IT NAMES SOMETHING ──────────────────────
     *
     * A sitemap is the set of URLs we are asking Google to spend crawl budget
     * on and to consider ranking. While the page had nothing on it but a
     * holding notice there was nothing worth ranking for, so it was left out.
     *
     * That condition used to be "has every client given written permission",
     * which was the right question when client work was the only thing here.
     * It is not any more: the Business Platform is ours, needs nobody's
     * consent, and is a real page with real content. The question is now
     * whether the page has anything on it at all.
     *
     * NOT a noindex. The page stays crawlable and stays in the header nav: it
     * is honest, it is linked, and a page-level noindex here would reintroduce
     * exactly the trap layout.tsx warns about. Leaving it out of the sitemap
     * says "not yet worth your time"; a noindex would say "never". Whether it
     * should also be noindexed is a founder call, not an SEO one.
     */
    ...(work.length > 0
      ? [
          {
            url: `${company.url}/work/`,
            lastModified,
            priority: 0.8,
            // Weekly, not monthly. This is now where daily work gets posted,
            // and telling a crawler to come back monthly for a page that
            // changes most weeks is asking it to serve a stale copy.
            changeFrequency: "weekly" as const,
          },
        ]
      : []),
    /*
     * Products, on the same condition and for the same reason: listed only
     * while the page names something. Ranked ABOVE /work/ because it is what
     * somebody can buy — a page that converts is worth more crawl budget than
     * a page that reassures.
     */
    ...(products.length > 0
      ? [
          {
            url: `${company.url}/products/`,
            lastModified,
            priority: 0.9,
            changeFrequency: "monthly" as const,
          },
        ]
      : []),
    { url: `${company.url}/approach/`, lastModified, priority: 0.8, changeFrequency: "yearly" },
    { url: `${company.url}/contact/`, lastModified, priority: 0.6, changeFrequency: "yearly" },
    { url: `${company.url}/privacy/`, lastModified, priority: 0.3, changeFrequency: "yearly" },
    { url: `${company.url}/terms/`, lastModified, priority: 0.3, changeFrequency: "yearly" },
    ...documentation,
  ];
}
