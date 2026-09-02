/**
 * The client portal, as seen from the marketing site.
 *
 * Genmars runs on three hostnames and each one has exactly one job:
 *
 *   genmars.co.ke       this site. Static files. No Node, no database, no
 *                       credential, no personal data at rest.
 *   app.genmars.co.ke   the portal. Accounts, dashboards, engagements.
 *   api.genmars.co.ke   the portal's Django API. Never called from here.
 *
 * That separation is the security boundary described in docs/PORTAL-INTEGRATION.md
 * §1, and it is why these are absolute URLs to another origin rather than routes.
 * A marketing site cannot have a dependency CVE at runtime because it has no
 * dependencies at runtime, and it cannot leak client data because it holds none.
 * Adding a login form here would give up both properties in one commit.
 *
 * ── WHAT THIS FILE IS NOT ───────────────────────────────────────────────────
 * It is NOT authentication, and nothing in it should ever be mistaken for it.
 * A static site served from disk cannot verify a session: it has no server to
 * ask, and the portal's session cookie is scoped to app.genmars.co.ke where
 * this origin's JavaScript cannot reach it. Everything below is signposting.
 *
 * Enforcement lives in the portal, on every request, in Django. If this file
 * were deleted the portal would be exactly as secure as it is now.
 */

/**
 * Where the portal lives.
 *
 * Overridable in development only. Next inlines NEXT_PUBLIC_* at build time, so
 * a production build — which does not set it — bakes in app.genmars.co.ke and
 * the branch disappears. The override exists because without it the round trip
 * cannot be exercised locally at all: every gate button would send a developer
 * on localhost to the live portal, which would then refuse to send them back.
 *
 *   NEXT_PUBLIC_PORTAL_ORIGIN=http://localhost:3010 npm run dev
 *
 * The portal's allowlist has the matching development entry — see
 * gen-portal/frontend/src/lib/returnTo.ts. Both are needed; either alone leaves
 * the loop half-open.
 */
const PORTAL_ORIGIN =
  process.env.NEXT_PUBLIC_PORTAL_ORIGIN ?? "https://app.genmars.co.ke";

/**
 * The API origin. Recorded here because the privacy policy has to name where a
 * client's data goes, and because someone will eventually ask. The site never
 * calls it — a fetch from this origin would be cross-origin, would need CORS
 * opened on the API, and would put client data on the public domain.
 */
export const PORTAL_API_ORIGIN = "https://api.genmars.co.ke";

export const portal = {
  origin: PORTAL_ORIGIN,
  /**
   * Shown to people, so no scheme — "app.genmars.co.ke" reads better, and it
   * is the part that carries the trust when we name where they are going.
   * Derived rather than written out again, so a dev override does not put the
   * production host in front of a developer looking at localhost.
   */
  host: PORTAL_ORIGIN.replace(/^https?:\/\//, ""),
  signIn: `${PORTAL_ORIGIN}/sign-in`,
  signUp: `${PORTAL_ORIGIN}/sign-up`,
  dashboard: `${PORTAL_ORIGIN}/dashboard`,
} as const;

/**
 * The parameter the portal reads to know where to send someone back to.
 *
 * Both sides must agree on this name — it is validated against an allowlist in
 * gen-portal/frontend/src/lib/returnTo.ts, and renaming it on one side turns
 * the round trip into a one-way door onto the dashboard.
 */
/*
 * ── WHAT USED TO BE HERE ────────────────────────────────────────────────────
 *
 * A return-trip mechanism and a localStorage flag ("this person has been to
 * the portal"), both serving the /request/ gate: send the visitor to the
 * portal to make an account, then bring them back to a form on this site.
 *
 * The gate and the form are gone — ordering happens per tier on /services/ and
 * finishes in the portal — so this became dead code that still wrote to a
 * visitor's browser. Removed rather than left: the privacy policy has to
 * describe every byte this site stores, and the shortest true description is
 * "none".
 */

export function orderUrl(serviceSlug?: string, tierName?: string): string {
  const params = new URLSearchParams();
  if (serviceSlug) params.set("service", serviceSlug);
  if (tierName) params.set("tier", tierName);
  // Called with nothing for the open "describe your problem" route. An empty
  // `?service=` would be a claim that a service was chosen and then lost,
  // which is worse than the honest absence of one.
  const query = params.toString();
  return query ? `${PORTAL_ORIGIN}/sign-up?${query}` : `${PORTAL_ORIGIN}/sign-up`;
}
