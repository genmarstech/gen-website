"use client";

import { useEffect, useState } from "react";
import {
  hasPortalAccount,
  portal,
  portalUrlWithReturn,
  rememberPortalAccount,
  RETURNED_PARAM,
  RETURNED_VALUE,
  returnUrlForCurrentPage,
} from "@/lib/portal";
import { LoadingMark } from "./LoadingMark";
import styles from "./RequestGate.module.css";

/**
 * Sends anyone without a portal account to set one up, then brings them back.
 *
 * ── THE JOURNEY ─────────────────────────────────────────────────────────────
 *   1. Someone clicks Request work, from anywhere on this site.
 *   2. If this browser has not been through the portal, it leaves for
 *      app.genmars.co.ke/sign-up immediately, carrying a return URL.
 *   3. They create an account and finish setting it up — or, if they are
 *      already signed in there, the portal turns them straight around.
 *   4. They land back here with ?from=portal and the request builder opens,
 *      with whatever they had already typed still in it.
 *
 * The point is the dashboard. A client who ends up working with us gets scope,
 * exclusions, the weekly progress note, milestones and payments in one place —
 * and they have it from the first conversation rather than being handed a login
 * after the first invoice, by which time the interesting part is already
 * scattered through email.
 *
 * ── WHY IT REDIRECTS RATHER THAN ASKS ───────────────────────────────────────
 * This used to render a card explaining the detour, with a button to start it.
 * That card was a page whose entire content was "go to the portal", and a
 * screen that exists only to be clicked through is a screen that should not
 * exist. So the click on Request work does the thing.
 *
 * The explanation still gets made, just at the destination instead of before
 * it: the portal's sign-up screen shows who sent you and where you will be
 * returned to (ReturnNotice, in gen-portal). That matters more than it sounds.
 * Being moved to a different domain that asks for a password, with no account
 * of why, is the exact shape of the thing people are taught to close — so the
 * arriving page has to answer it, and it does.
 *
 * ── WHAT THIS IS NOT ────────────────────────────────────────────────────────
 * Not a security control. This site is a static export with no server; it
 * cannot verify a session and does not try to. Read lib/portal.ts before
 * assuming otherwise. What is behind this is a form that composes an email in
 * your own mail client — this routes people to an account at the moment an
 * account starts being useful, it does not protect anything.
 *
 * ── WHY IT IS ON THIS PAGE RATHER THAN ON THE LINKS ─────────────────────────
 * Seven places link to /request/ — the header, the mobile panel, the command
 * palette, two calls to action on the work page, the home page twice — plus the
 * sitemap and anyone's bookmark. Pointing each of those at the portal would
 * leave a direct visit to /request/ ungated and would have to be redone every
 * time a new link is added. One decision on the destination covers all of them.
 *
 * It also could not work on the links even if we wanted it to: whether this
 * browser has been through the portal is only knowable after mount, and a link
 * has to render its href before that.
 */
export function RequestGate({ children }: { children: React.ReactNode }) {
  /**
   * "unknown" is the pre-mount state and it is the one that matters.
   *
   * Local storage does not exist during the static export, so at build time the
   * honest answer is "we do not know yet". Rendering either branch would be a
   * guess that corrects itself in front of the visitor — either the form
   * flashing up before it is replaced by a redirect, or the reverse.
   */
  const [state, setState] = useState<"unknown" | "leaving" | "open">("unknown");

  useEffect(() => {
    const url = new URL(window.location.href);

    /**
     * Back from the portal. Anyone can type this parameter — see the note in
     * lib/portal.ts on why that does not matter here — and the round trip costs
     * nothing to honour.
     */
    if (url.searchParams.get(RETURNED_PARAM) === RETURNED_VALUE) {
      rememberPortalAccount();

      /**
       * Take the marker back out of the address bar. It has done its job, and
       * leaving it there means the visitor copies a link with it, bookmarks it,
       * or reloads into a URL that says something about them. replaceState
       * rather than a redirect so the back button still goes where they expect.
       */
      url.searchParams.delete(RETURNED_PARAM);
      window.history.replaceState(null, "", url.toString());

      setState("open");
      return;
    }

    if (hasPortalAccount()) {
      setState("open");
      return;
    }

    setState("leaving");

    /**
     * assign, not replace.
     *
     * Back from the portal's sign-up must return to the page they were reading,
     * not to the redirect that bounced them. `replace` would drop /request/ out
     * of history and send Back to whatever preceded it, which for anyone who
     * came from the header is a page they never chose to leave.
     */
    window.location.assign(
      portalUrlWithReturn(portal.signUp, returnUrlForCurrentPage()),
    );
  }, []);

  if (state === "open") return <>{children}</>;

  /**
   * The hold. Visible for the moment between mount and the browser leaving,
   * and on a slow connection for longer than that — so it names the
   * destination rather than spinning anonymously. Someone who ends up on
   * app.genmars.co.ke should have already read where they were going.
   */
  return (
    <div className={styles.holding}>
      <LoadingMark size={32} label={null} />
      <p className={styles.holdingText} role="status">
        {state === "leaving"
          ? `Taking you to ${portal.host} to set up your account — you will come straight back here.`
          : "One moment."}
      </p>
      <noscript>
        <p className={styles.holdingText}>
          Requesting work starts with an account at{" "}
          <a href={portal.signUp}>{portal.host}</a>. Come back here afterwards,
          or email <a href="mailto:info@genmars.co.ke">info@genmars.co.ke</a>.
        </p>
      </noscript>
    </div>
  );
}
