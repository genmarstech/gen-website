import type { MetadataRoute } from "next";
import { company } from "@/lib/company";

/**
 * sitemap.xml
 *
 * Generated now so it is correct on launch day. It has no effect while
 * robots.ts disallows crawling — see the note there.
 *
 * Privacy and terms are omitted deliberately: they are placeholder routes and
 * listing them would invite indexing of pages that say "not yet published".
 * Add them once real text is in place.
 */
/** Required by `output: "export"` — these are emitted at build time. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${company.url}/`, lastModified: now, priority: 1 },
    { url: `${company.url}/services/`, lastModified: now, priority: 0.8 },
    { url: `${company.url}/work/`, lastModified: now, priority: 0.8 },
    { url: `${company.url}/request/`, lastModified: now, priority: 0.7 },
    { url: `${company.url}/approach/`, lastModified: now, priority: 0.8 },
    { url: `${company.url}/contact/`, lastModified: now, priority: 0.6 },
  ];
}
