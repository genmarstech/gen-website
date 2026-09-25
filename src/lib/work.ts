/**
 * The work this site builds from.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * READ AT BUILD TIME, AND AGAIN IN THE BROWSER. BOTH HALVES MATTER.
 *
 * The site is `output: "export"`. `npm run build` calls this once and writes
 * real HTML, so /work survives the API being down, renders with JavaScript
 * off, and shows a crawler the words without executing anything. That baked
 * copy is the floor and is never removed.
 *
 * On top of it, app/work/LiveWork.tsx re-reads this endpoint in the browser
 * and swaps in anything newer, so publishing in operations is visible on the
 * next page load instead of at the next deploy. If that fetch fails for any
 * reason the baked copy simply stays — the refresh can only ever add
 * freshness, never take the page away.
 *
 * ⚠ THAT SECOND READ NEEDS `connect-src` TO NAME THIS ORIGIN. It is in
 *   deploy/container.Caddyfile. Tightening the CSP back to 'self' does not
 *   break the page — it silently freezes it at the last deploy, which is the
 *   harder fault to notice.
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

/**
 * Where to read from. Overridable so a staging API can be built against.
 *
 * Exported because the browser-side refresh needs the same value, and
 * `process.env` is not readable from a client bundle unless the name is
 * NEXT_PUBLIC_-prefixed — reading it there would quietly resolve to the
 * default and build against staging while serving production.
 */
export const API_ORIGIN =
  process.env.DOCS_API_ORIGIN ?? "https://api.genmars.co.ke";

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
const inFlight = new Map<string, Promise<WorkPayload>>();

function load(path: string): Promise<WorkPayload> {
  const existing = inFlight.get(path);
  if (existing) return existing;
  const started = fetchList(path);
  inFlight.set(path, started);
  return started;
}

export function loadWork(): Promise<WorkPayload> {
  return load("work");
}

/**
 * The products page reads the same shape from a different endpoint.
 *
 * Two routes, one payload type, one renderer — see ProductListView in
 * gen-portal. Products and work are one table split by label, so a second
 * TypeScript type here would be a second description of the same record.
 */
export function loadProducts(): Promise<WorkPayload> {
  return load("products");
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

async function fetchList(path: string): Promise<WorkPayload> {
  const url = `${API_ORIGIN}/api/public/${path}`;

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
  return orEmpty(loadWork());
}

/** Same bargain for products: a page that says nothing yet beats no site. */
export async function loadProductsOrEmpty(): Promise<WorkPayload> {
  return orEmpty(loadProducts());
}

async function orEmpty(pending: Promise<WorkPayload>): Promise<WorkPayload> {
  try {
    return await pending;
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
