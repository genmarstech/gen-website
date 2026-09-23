/**
 * The work this site builds from.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BUILD TIME ONLY, EXACTLY LIKE lib/docs.ts, AND FOR THE SAME THREE REASONS.
 *
 * The site is `output: "export"`. `npm run build` calls this once and writes
 * real HTML; a visitor's browser never contacts the API. So /work cannot break
 * when the API is down, the public origin needs no `connect-src` opening, and
 * a crawler sees the words without executing anything.
 *
 * The cost is that publishing takes a deploy, which the operations screen says.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── THIS REPLACED A HAND-EDITED ARRAY, AND THAT IS THE POINT ───────────────
 *
 * `work` used to live in src/lib/company.ts. Adding a project meant editing
 * TypeScript and deploying the marketing site, so it went stale — the worst
 * state for a page whose entire job is to prove the company does things.
 *
 * ⚠ THE CONSENT GATE IS NOT HERE. Charter 04 §V is enforced by the queryset in
 *   gen-portal (portal/public_api.WorkPublished): an item naming a client is
 *   absent from this payload until their written permission is on file. There
 *   is deliberately no filtering on this side — a rule enforced in two places
 *   is a rule that will eventually disagree with itself, and the half that
 *   matters is the one nearest the data.
 */

/** Where to read from. Overridable so a staging API can be built against. */
const ORIGIN = process.env.DOCS_API_ORIGIN ?? "https://api.genmars.co.ke";

export type WorkCategory =
  | "sites"
  | "apps"
  | "software"
  | "design-systems"
  | "tools"
  | "integrations";

export type WorkItem = {
  slug: string;
  name: string;
  category: WorkCategory | string;
  category_display: string;
  label: string;
  label_display: string;
  sector: string;
  year: string;
  url: string;
  summary: string;
  detail: string;
  capabilities: string[];
  architecture: string;
  engineering: string;
  results: string;
  order: number;
  updated_at: string;
};

export type WorkPayload = {
  work: WorkItem[];
  categories: { key: string; label: string }[];
};

/*
 * One request per build, shared by every route that asks.
 *
 * /work and sitemap.ts both read this; without the shared promise each would
 * fetch again, which is two chances for one of them to fail differently from
 * the other. Same reasoning as loadDocs.
 */
let inFlight: Promise<WorkPayload> | null = null;

export function loadWork(): Promise<WorkPayload> {
  inFlight ??= fetchWork();
  return inFlight;
}

/** Next signals "this cannot be static" by throwing; that is not an outage. */
function isNextBailout(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  const name = (error as { name?: unknown } | null)?.name;
  return (
    code === "NEXT_STATIC_GEN_BAILOUT" ||
    name === "DynamicServerError" ||
    String(code ?? "").startsWith("NEXT_")
  );
}

async function fetchWork(): Promise<WorkPayload> {
  const url = `${ORIGIN}/api/public/work`;

  let response: Response;
  try {
    /*
     * force-cache, NOT no-store — see the long note in lib/docs.ts. `no-store`
     * marks the fetch dynamic and every route reading it inherits that, which
     * `force-static` routes refuse with NEXT_STATIC_GEN_BAILOUT.
     */
    response = await fetch(url, { cache: "force-cache" });
  } catch (cause) {
    if (isNextBailout(cause)) throw cause;

    throw new Error(
      `Could not reach ${url} to read the work.\n\n` +
        "The build reads /work from the API. Unlike /docs this does NOT stop " +
        "the build — see below — so if you are seeing this, something " +
        "re-threw it.\n\n" +
        "Check the API is up, or set DOCS_API_ORIGIN to build against " +
        "something else.",
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(
      `${url} answered ${response.status}. The work could not be read.`,
    );
  }

  const payload = (await response.json()) as WorkPayload;

  if (!Array.isArray(payload.work)) {
    throw new Error(`${url} did not return a work array.`);
  }

  return payload;
}

/**
 * The work, or nothing, without stopping the build.
 *
 * ── WHY THIS DIFFERS FROM /docs, WHICH FAILS THE BUILD ────────────────────
 *
 * An empty /docs is a broken section AND a sitemap advertising pages that
 * 404, so docs.ts is right to stop everything. /work degrades honestly: the
 * page says nothing is published yet, the sitemap omits it, and the rest of
 * the site ships. Taking the marketing site down because a portfolio entry
 * could not be read would be the wrong trade.
 */
export async function loadWorkOrEmpty(): Promise<WorkPayload> {
  try {
    return await loadWork();
  } catch (error) {
    if (isNextBailout(error)) throw error;
    return { work: [], categories: [] };
  }
}

/** Grouped the way the page renders it, in the API's category order. */
export function byCategory(
  payload: WorkPayload,
): { key: string; label: string; items: WorkItem[] }[] {
  return payload.categories.map((category) => ({
    ...category,
    items: payload.work.filter((item) => item.category === category.key),
  }));
}
