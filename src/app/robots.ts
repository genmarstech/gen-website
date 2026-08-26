import type { MetadataRoute } from "next";
import { company } from "@/lib/company";

/**
 * robots.txt
 *
 * CURRENTLY DISALLOWS EVERYTHING, on purpose.
 *
 * Charter 03 §IV Tier 1 requires a published privacy policy and terms of
 * service before anything goes live. Both are still drafts awaiting advocate
 * review (05-policies/Genmars-Policy-Pack-v0.1.pdf), so the site is not cleared
 * to be indexed.
 *
 * TO LAUNCH: work docs/PRE-LAUNCH.md to completion, then swap the disallow for
 * the allow block below and drop `robots: { index: false }` from the metadata
 * in src/app/layout.tsx. Both must change — one without the other is a
 * half-launch that is hard to debug later.
 */
/** Required by `output: "export"` — these are emitted at build time. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",

      // ---- launch configuration, currently inactive ----
      // allow: "/",
      // disallow: ["/privacy/", "/terms/"],  // only if they remain unpublished
    },
    sitemap: `${company.url}/sitemap.xml`,
  };
}
