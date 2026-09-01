"use client";

import { useEffect, useState } from "react";
import { contact } from "@/lib/company";
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
 * The account step in front of "Request work".
 *
 * ── THE JOURNEY ─────────────────────────────────────────────────────────────
 *   1. Someone clicks Request work, from anywhere on this site.
 *   2. This screen explains the detour and sends them to app.genmars.co.ke,
 *      carrying a return URL back to the page they were on.
 *   3. They sign in, or create an account and finish setting it up.
 *   4. The portal returns them here with ?from=portal, and the request builder
 *      opens with whatever they had already typed still in it.
 *
 * The point is the dashboard. A client who ends up working with us gets scope,
 * exclusions, the weekly progress note, milestones and payments in one place —
 * and they have it from the first conversation rather than being handed a login
 * after the first invoice, by which time the interesting part is already
 * scattered through email.
 *
 * ── WHAT THIS IS NOT ────────────────────────────────────────────────────────
 * Not a security control. This site is a static export with no server; it
 * cannot verify a session and does not try to. Read lib/portal.ts before
 * assuming otherwise. What is behind this gate is a form that composes an
 * email in your own mail client — the gate exists to route people to an account
 * at the moment an account starts being useful, not to protect anything.
 *
 * ── WHY IT IS ON THIS PAGE RATHER THAN ON THE LINKS ─────────────────────────
 * Seven places link to /request/ — the header, the mobile panel, the command
 * palette, two calls to action on the work page, the home page twice — plus the
 * sitemap and anyone's bookmark. Pointing each of those at the portal would
 * leave a direct visit to /request/ ungated and would have to be redone every
 * time a new link is added. One gate on the destination covers all of them.
 */
export function RequestGate({ children }: { children: React.ReactNode }) {
  /**
   * Three states, and the first one matters.
   *
   * "unknown" is the pre-mount state. Local storage does not exist during the
   * static export, so the honest answer at build time is "we do not know yet",
   * and rendering either branch would be a guess that flashes and corrects
   * itself in front of the visitor. It renders a hold instead.
   */
  const [state, setState] = useState<"unknown" | "gated" | "open">("unknown");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    /**
     * Back from the portal. Anyone can type this parameter — see the note in
     * lib/portal.ts on why that does not matter here — and the round trip
     * costs nothing to honour.
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

    setState(hasPortalAccount() ? "open" : "gated");
  }, []);

  if (state === "open") return <>{children}</>;

  if (state === "unknown") {
    return (
      <div className={styles.holding} aria-hidden="true">
        <LoadingMark size={32} label={null} />
      </div>
    );
  }

  /**
   * Both buttons go to the portal; they differ only in which screen they land
   * on, and each screen links across to the other. Two doors rather than one
   * because "Sign in" and "Create an account" are read by two different people,
   * and making the returning client hunt for the small link is the worse of the
   * two mistakes.
   */
  function leaveFor(base: string) {
    setLeaving(true);
    window.location.assign(portalUrlWithReturn(base, returnUrlForCurrentPage()));
  }

  return (
    <div className={styles.gate}>
      <div className={styles.card}>
        <p className="eyebrow">One step first</p>
        <h2 className={styles.title}>
          Set up your account, then tell us what you need.
        </h2>

        <p className={styles.lede}>
          Requests start an account, and the account is the useful part. Scope
          and exclusions, a written progress note every week, milestones and
          what has been paid — in one place from the first conversation, instead
          of scattered through an email thread nobody can search six months
          later.
        </p>

        <ul className={styles.points}>
          <li>
            <span className={styles.pointTitle}>It takes a minute</span>
            An email address, a password, and a six-digit code to prove the
            address works.
          </li>
          <li>
            <span className={styles.pointTitle}>It does not order anything</span>
            An account is an account. Work begins when scope is agreed and a
            statement of work is signed, and not before.
          </li>
          <li>
            <span className={styles.pointTitle}>You come straight back</span>
            We return you to this page when you are set up, with anything you
            had already typed still here.
          </li>
        </ul>

        <div className={styles.actions}>
          <button
            type="button"
            className={`btn ${styles.primary}`}
            onClick={() => leaveFor(portal.signUp)}
            disabled={leaving}
          >
            {leaving ? (
              <>
                <LoadingMark size={16} label={null} />
                Taking you to {portal.host}
              </>
            ) : (
              "Create an account"
            )}
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => leaveFor(portal.signIn)}
            disabled={leaving}
          >
            I already have one
          </button>
        </div>

        <p className={styles.where} role="status">
          {leaving
            ? `Opening ${portal.host}.`
            : `Both go to ${portal.host} — the same company, a different server. The portal is where accounts and client data live; this site holds neither.`}
        </p>

        <p className={styles.fallback}>
          Would rather just send an email?{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a> reaches the
          same people.
        </p>
      </div>
    </div>
  );
}
