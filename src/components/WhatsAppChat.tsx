"use client";

import { useEffect, useRef, useState } from "react";
import { socials } from "@/lib/company";
import styles from "./WhatsAppChat.module.css";

/**
 * A way to start a WhatsApp conversation, from any page.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * NO THIRD-PARTY WIDGET, AND THAT IS NOT A PREFERENCE.
 *
 * The usual answer here is a hosted script from a chat vendor. It would mean
 * widening script-src and connect-src on a site whose CSP currently names one
 * origin, handing a third party the ability to execute on every page, and
 * shipping an analytics beacon to visitors who came to read about a software
 * company. Charter 03 §I settles it before any of that: what is already here
 * does the job. A link does the job.
 *
 * So this is an anchor with a panel in front of it. It works with JavaScript
 * disabled down to the anchor itself, it loads nothing, and it cannot watch
 * anybody.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── IT PROMISES NOTHING, AND THAT IS LOAD-BEARING ──────────────────────────
 *
 * company.ts carries the decision that put WhatsApp here instead of a phone
 * number, and the warning attached to it:
 *
 *     NOTHING ON THIS SITE CLAIMS A RESPONSE TIME, and that must stay true —
 *     "we usually reply within a few hours" is a Tier 2 commitment typed by
 *     accident.
 *
 * Charter 03 §IV. A chat bubble is exactly where that sentence gets typed,
 * because every widget on the internet says something like it. The copy below
 * says what happens — the message reaches us — and never when. Do not add
 * "typically replies instantly", an online dot, or a status line: an online
 * indicator is a response-time claim without the words.
 */
export function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  /* Focus moves into the panel when it opens, so a keyboard user is not left
     behind the button they just pressed. */
  useEffect(() => {
    if (open) panel.current?.querySelector("a")?.focus();
  }, [open]);

  return (
    <div ref={wrap} className={styles.wrap}>
      {open ? (
        <div
          ref={panel}
          className={styles.panel}
          role="dialog"
          aria-label="Message Genmars on WhatsApp"
        >
          <p className={styles.title}>Message us on WhatsApp</p>
          <p className={styles.body}>
            {/*
              What happens, not when. See the banner above — the sentence that
              belongs here on most sites is a response-time commitment.
            */}
            Tell us what you are trying to build or fix. It goes to the same
            people who would answer an email.
          </p>
          <a
            className={styles.cta}
            href={`${socials.whatsapp.url}?text=${MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <WhatsAppMark />
            Open WhatsApp
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
          <p className={styles.number}>{socials.whatsapp.handle}</p>
        </div>
      ) : null}

      <button
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp panel" : "Message us on WhatsApp"}
        onClick={() => setOpen(!open)}
      >
        {open ? <CloseMark /> : <WhatsAppMark />}
      </button>
    </div>
  );
}

/*
 * Prefilled, because an empty chat window is its own small barrier — somebody
 * has to compose an opening line to a company they have not spoken to. This
 * is a first line they can send or delete.
 *
 * encodeURIComponent, not a raw string: wa.me takes this as a query parameter
 * and an unescaped apostrophe or ampersand truncates the message silently.
 */
const MESSAGE = encodeURIComponent(
  "Hello Genmars — I found you through your website and I would like to talk about a project.",
);

/**
 * The WhatsApp glyph.
 *
 * `currentColor`, not their green: this sits on our button, in our palette,
 * and a two-colour logo dropped onto an accent field is the version that looks
 * wrong in one of the two themes. The shape is what identifies it.
 */
function WhatsAppMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.21-8.24 8.21z" />
    </svg>
  );
}

function CloseMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
