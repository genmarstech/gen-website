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
const RETURN_PARAM = "return";

/** The marker the portal hands back on the return URL. See rememberAccount(). */
export const RETURNED_PARAM = "from";
export const RETURNED_VALUE = "portal";

/**
 * A portal URL that comes back here when the account is set up.
 *
 * `returnTo` is built from the live location rather than from company.url, so
 * the loop closes on whichever origin the visitor is actually on — localhost
 * in development, www or bare in production. Hard-coding one origin sends
 * anyone on the other to a domain they were not browsing.
 */
export function portalUrlWithReturn(base: string, returnTo: string): string {
  return `${base}?${RETURN_PARAM}=${encodeURIComponent(returnTo)}`;
}

/**
 * The URL to come back to: where the visitor is now, marked as a return.
 *
 * Preserves the existing query string — someone who arrived on
 * /request/?service=payments must not lose that preselection on the round trip.
 */
export function returnUrlForCurrentPage(): string {
  const url = new URL(window.location.href);
  url.searchParams.set(RETURNED_PARAM, RETURNED_VALUE);
  return url.toString();
}

/* ── the "you have been here before" hint ─────────────────────────────────── */

/**
 * Local storage key. Named and documented because the privacy policy lists
 * every key this site writes, and an undocumented one makes that list a lie.
 */
const ACCOUNT_HINT_KEY = "gm-portal-account";

/**
 * Has this browser completed the portal round trip?
 *
 * A hint, and only a hint. It is a boolean this origin wrote to its own local
 * storage; anyone can set it from the console in four seconds. That is fine,
 * and it is worth being clear about why: the thing it gates is a form that
 * composes an email in your own mail client. There is nothing behind it to
 * steal. Someone who forges this flag has won the right to send us an email,
 * which they could also do by typing our address.
 *
 * Never gate anything of value on this. If something of value ever appears on
 * this site, it belongs on the portal instead.
 */
export function hasPortalAccount(): boolean {
  try {
    return window.localStorage.getItem(ACCOUNT_HINT_KEY) === "1";
  } catch {
    // Private browsing, or storage disabled. Treated as "no account", which
    // costs a returning visitor one extra trip through a sign-in they are
    // already signed in for — the portal will pass them straight through.
    return false;
  }
}

export function rememberPortalAccount(): void {
  try {
    window.localStorage.setItem(ACCOUNT_HINT_KEY, "1");
  } catch {
    // Nothing to do. The gate simply asks again next time.
  }
}

export function forgetPortalAccount(): void {
  try {
    window.localStorage.removeItem(ACCOUNT_HINT_KEY);
  } catch {
    /* as above */
  }
}
