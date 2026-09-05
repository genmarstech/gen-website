import type { MetadataRoute } from "next";
import { company } from "@/lib/company";

/**
 * robots.txt
 *
 * ── THE SITE IS OPEN TO CRAWLERS AS OF 2026-09-05 ───────────────────────────
 *
 * It disallowed everything from the first deploy until now. Charter 03 §IV
 * Tier 1 requires a published privacy policy and terms of service before
 * anything goes live, and until today both were drafts — /terms/ was literally
 * a page saying "this document is not yet published".
 *
 * Both are now written, verified against the running system, and published.
 * The founder's call to open the site was made with the advocate review still
 * outstanding (Charter 02 §I — public statements are the founder's), and both
 * documents carry a visible draft notice saying exactly that. A policy that is
 * accurate and openly marked unreviewed is a defensible thing to publish; the
 * placeholder that was here before was not.
 *
 * ── WHAT IS STILL DISALLOWED, AND WHY IT IS NOT A POLICY DECISION ───────────
 *
 * Nothing. There is no admin area, no search, no faceted URLs and no user
 * content on this host — it is a static export of nine pages. A disallow rule
 * for a path that does not exist is noise that outlives whoever wrote it.
 *
 * app., api. and ops. are separate origins with their own robots.txt and are
 * not reachable from this file. Do not add rules for them here.
 *
 * ── THE PAIR THAT MUST STAY IN STEP ─────────────────────────────────────────
 *
 * This file and `robots` in src/app/layout.tsx. One without the other is the
 * half-launch the old comment warned about: an allow here with noindex in the
 * markup means Google crawls every page and indexes none, and Search Console
 * reports it as "Excluded by 'noindex' tag" — which reads like a bug and is
 * not one. Both changed together in the same commit.
 */
/** Required by `output: "export"` — these are emitted at build time. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${company.url}/sitemap.xml`,
  };
}
