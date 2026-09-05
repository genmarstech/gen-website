import type { MetadataRoute } from "next";
import { company } from "@/lib/company";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_REVIEWED;

  return [
    { url: `${company.url}/`, lastModified, priority: 1, changeFrequency: "monthly" },
    { url: `${company.url}/services/`, lastModified, priority: 0.9, changeFrequency: "monthly" },
    { url: `${company.url}/work/`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${company.url}/approach/`, lastModified, priority: 0.8, changeFrequency: "yearly" },
    { url: `${company.url}/contact/`, lastModified, priority: 0.6, changeFrequency: "yearly" },
    { url: `${company.url}/privacy/`, lastModified, priority: 0.3, changeFrequency: "yearly" },
    { url: `${company.url}/terms/`, lastModified, priority: 0.3, changeFrequency: "yearly" },
  ];
}
