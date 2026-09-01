import type { MetadataRoute } from "next";
import { company } from "@/lib/company";

/**
 * sitemap.xml
 *
 * Generated now so it is correct on launch day. It has no effect while
 * robots.ts disallows crawling — see the note there.
 *
 * ── WHAT IS OMITTED, AND WHY ────────────────────────────────────────────────
 *
 * `/privacy/` and `/terms/` — placeholder and draft routes. Listing them would
 * invite indexing of pages that currently say "not yet published", and a
 * policy page in Google's index saying that is worse than no policy page in it.
 * Add them when real text is in place (docs/PRE-LAUNCH.md, Gate 1).
 *
 * `/request/` — it no longer renders as a page for a first-time visitor. It
 * sends them to app.genmars.co.ke to set up an account and brings them back,
 * which a crawler experiences as a client-side redirect off the site. Listing
 * a URL that redirects away is asking Google to discover a page and then
 * telling it the page is somewhere else. `/contact/` is the indexable route
 * for someone who wants to get in touch.
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
const CONTENT_REVIEWED = "2026-09-01";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_REVIEWED;

  return [
    { url: `${company.url}/`, lastModified, priority: 1, changeFrequency: "monthly" },
    { url: `${company.url}/services/`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${company.url}/work/`, lastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${company.url}/approach/`, lastModified, priority: 0.8, changeFrequency: "yearly" },
    { url: `${company.url}/contact/`, lastModified, priority: 0.6, changeFrequency: "yearly" },
  ];
}
