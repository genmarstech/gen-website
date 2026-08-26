"use client";

import { useEffect, useMemo, useState } from "react";
import { contact, offers } from "@/lib/company";
import { LoadingMark } from "./LoadingMark";
import styles from "./RequestBuilder.module.css";

/**
 * Service request builder.
 *
 * ── WHY IT WORKS THIS WAY ────────────────────────────────────────────────────
 * This looks like a contact form and behaves like one, but nothing is submitted
 * anywhere. Every keystroke stays in the browser; pressing the button composes a
 * `mailto:` and hands it to the visitor's own mail client.
 *
 * That is deliberate, not a limitation:
 *   - Charter 03 §V requires a written processing agreement for any engagement
 *     involving personal data. A third-party form handler would be a processor
 *     we have no agreement with, added casually — which Charter 03 §I forbids.
 *   - A form that silently fails is worse than no form. Here the visitor watches
 *     their mail client open with the message in it, and keeps a copy in Sent.
 *   - Nothing to run, patch, rate-limit or breach.
 *
 * The questions are the Playbook's five qualification questions (§3.1) turned
 * outward — asked of the client, for their benefit, so the first reply is useful
 * instead of a list of questions back.
 *
 * NO PRICES. The budget field offers ranges the visitor picks from, and none of
 * them are quoted back as our rates — pricing is still open (Charter 02 §I).
 */

const TIMELINES = [
  "As soon as possible",
  "Within 1–3 months",
  "3–6 months",
  "Still exploring",
] as const;

const BUDGETS = [
  "Not sure yet — advise me",
  "Under KES 150,000",
  "KES 150,000 – 500,000",
  "KES 500,000 – 1.5M",
  "Over KES 1.5M",
] as const;

type Draft = {
  service: string;
  organisation: string;
  name: string;
  problem: string;
  cost: string;
  timeline: string;
  budget: string;
  decisionMakers: string;
};

const EMPTY: Draft = {
  service: "",
  organisation: "",
  name: "",
  problem: "",
  cost: "",
  timeline: "",
  budget: "",
  decisionMakers: "",
};

export function RequestBuilder() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [copied, setCopied] = useState(false);
  /**
   * Handing off to the OS mail client. There is no completion event for a
   * mailto: — the browser either opens an app or it does not — so this is a
   * short, honest "opening" state rather than a progress bar pretending to
   * track something. Labelled accordingly.
   */
  const [handingOff, setHandingOff] = useState(false);

  useEffect(() => {
    if (!handingOff) return;
    const timer = window.setTimeout(() => setHandingOff(false), 2200);
    return () => window.clearTimeout(timer);
  }, [handingOff]);

  /**
   * Deep link support: /request/?service=payments preselects an offer, which is
   * what the command palette and the services page link into.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("service");
    const match = offers.find((offer) => offer.slug === slug);
    if (match) setDraft((d) => ({ ...d, service: match.name }));
  }, []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setCopied(false);
  }

  const subject = useMemo(() => {
    const who = draft.organisation.trim();
    const what = draft.service || "Project enquiry";
    return who ? `${what} — ${who}` : what;
  }, [draft.organisation, draft.service]);

  const body = useMemo(() => {
    const lines: string[] = [];

    if (draft.name.trim()) lines.push(`From: ${draft.name.trim()}`);
    if (draft.organisation.trim())
      lines.push(`Organisation: ${draft.organisation.trim()}`);
    if (draft.service) lines.push(`Service: ${draft.service}`);
    if (lines.length) lines.push("");

    if (draft.problem.trim()) {
      lines.push("What is happening today:");
      lines.push(draft.problem.trim());
      lines.push("");
    }
    if (draft.cost.trim()) {
      lines.push("What it costs us per month:");
      lines.push(draft.cost.trim());
      lines.push("");
    }
    if (draft.decisionMakers.trim()) {
      lines.push("Who else needs to agree:");
      lines.push(draft.decisionMakers.trim());
      lines.push("");
    }
    if (draft.timeline) lines.push(`Timeline: ${draft.timeline}`);
    if (draft.budget) lines.push(`Budget range: ${draft.budget}`);

    return lines.join("\n").trim();
  }, [draft]);

  const ready = draft.problem.trim().length > 12;

  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: ${contact.email}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // Clipboard blocked. The preview is on screen and selectable, so the
      // visitor can still copy it by hand.
    }
  }

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        {/* ---- service ---- */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            <span className={styles.step}>01</span>
            What do you need?
          </legend>

          <div className={styles.chips} role="group" aria-label="Service">
            {offers.map((offer) => {
              const active = draft.service === offer.name;
              return (
                <button
                  key={offer.slug}
                  type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                  aria-pressed={active}
                  onClick={() => set("service", active ? "" : offer.name)}
                >
                  {offer.name}
                </button>
              );
            })}
            <button
              type="button"
              className={`${styles.chip} ${
                draft.service === "Not sure yet" ? styles.chipActive : ""
              }`}
              aria-pressed={draft.service === "Not sure yet"}
              onClick={() =>
                set(
                  "service",
                  draft.service === "Not sure yet" ? "" : "Not sure yet",
                )
              }
            >
              Not sure yet
            </button>
          </div>
        </fieldset>

        {/* ---- the problem ---- */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            <span className={styles.step}>02</span>
            What is going wrong?
          </legend>

          <label className={styles.label} htmlFor="problem">
            What is happening today that made you look for this now?
            <span className={styles.req} aria-hidden="true">
              required
            </span>
          </label>
          <textarea
            id="problem"
            className={styles.textarea}
            rows={5}
            value={draft.problem}
            onChange={(e) => set("problem", e.target.value)}
            placeholder="Someone spends two days a month matching M-Pesa payments to invoices by hand, and we got it wrong twice last quarter."
          />
          <p className={styles.help}>
            A specific trigger tells us more than a feature list. Something broke,
            someone left, a deadline moved.
          </p>

          <label className={styles.label} htmlFor="cost">
            Roughly what does it cost you a month?
          </label>
          <input
            id="cost"
            className={styles.input}
            value={draft.cost}
            onChange={(e) => set("cost", e.target.value)}
            placeholder="About 16 hours of admin time, plus the errors we do not catch"
          />
          <p className={styles.help}>
            Hours, shillings, or lost customers. A rough figure is fine — if it
            costs nothing, it can usually wait, and we will say so.
          </p>
        </fieldset>

        {/* ---- shape ---- */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            <span className={styles.step}>03</span>
            Shape of the work
          </legend>

          <span className={styles.label} id="timeline-label">
            When does it need to be working?
          </span>
          <div
            className={styles.chips}
            role="group"
            aria-labelledby="timeline-label"
          >
            {TIMELINES.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.chip} ${
                  draft.timeline === option ? styles.chipActive : ""
                }`}
                aria-pressed={draft.timeline === option}
                onClick={() =>
                  set("timeline", draft.timeline === option ? "" : option)
                }
              >
                {option}
              </button>
            ))}
          </div>

          <span className={styles.label} id="budget-label">
            What range have you set aside?
          </span>
          <div
            className={styles.chips}
            role="group"
            aria-labelledby="budget-label"
          >
            {BUDGETS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.chip} ${
                  draft.budget === option ? styles.chipActive : ""
                }`}
                aria-pressed={draft.budget === option}
                onClick={() =>
                  set("budget", draft.budget === option ? "" : option)
                }
              >
                {option}
              </button>
            ))}
          </div>
          <p className={styles.help}>
            These are your ranges, not our prices — we have not published rates.
            Knowing the range early stops us both wasting time on a proposal that
            was never going to fit.
          </p>

          <label className={styles.label} htmlFor="decision">
            Who else has to agree before this goes ahead?
          </label>
          <input
            id="decision"
            className={styles.input}
            value={draft.decisionMakers}
            onChange={(e) => set("decisionMakers", e.target.value)}
            placeholder="Me and our finance manager"
          />
        </fieldset>

        {/* ---- who ---- */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            <span className={styles.step}>04</span>
            Who are you?
          </legend>

          <div className={styles.row}>
            <div>
              <label className={styles.label} htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                className={styles.input}
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="org">
                Organisation
              </label>
              <input
                id="org"
                className={styles.input}
                value={draft.organisation}
                onChange={(e) => set("organisation", e.target.value)}
                autoComplete="organization"
              />
            </div>
          </div>
        </fieldset>
      </form>

      {/* ---- preview ---- */}
      <aside className={styles.preview} aria-label="Message preview">
        <div className={styles.previewInner}>
          <div className={styles.previewHead}>
            <h2 className={styles.previewTitle}>Your message</h2>
            <p className={styles.previewNote}>
              Nothing is sent from this page. This opens your own email app with
              the message ready — you keep the copy.
            </p>
          </div>

          <div className={styles.envelope}>
            <p className={styles.envelopeRow}>
              <span>To</span>
              {contact.email}
            </p>
            <p className={styles.envelopeRow}>
              <span>Subject</span>
              {subject}
            </p>
          </div>

          <pre className={styles.body} aria-live="polite">
            {body || "Your answers appear here as you type."}
          </pre>

          <div className={styles.actions}>
            <a
              href={ready ? mailto : undefined}
              className={`btn ${styles.send}`}
              aria-disabled={!ready}
              data-no-progress
              onClick={(e) => {
                if (!ready) {
                  e.preventDefault();
                  return;
                }
                setHandingOff(true);
              }}
            >
              {handingOff ? (
                <>
                  <LoadingMark size={16} label={null} />
                  Opening your email app
                </>
              ) : (
                "Open in email"
              )}
            </a>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={copy}
              disabled={!ready}
            >
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>

          <p className={styles.status} role="status">
            {handingOff
              ? "Handing this to your email app. If nothing opens, use Copy text instead."
              : ready
                ? "Ready to send."
                : "Answer question 02 and the message becomes sendable."}
          </p>

          <p className={styles.fallback}>
            Prefer to write it yourself?{" "}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
        </div>
      </aside>
    </div>
  );
}
