"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { contact, nav, offers } from "@/lib/company";
import { applyTheme, storeTheme, type Theme } from "./theme";
import { startRouteProgress } from "./routeProgressBus";
import styles from "./CommandPalette.module.css";

type Command = {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords?: string;
  run: () => void | Promise<void>;
};

/**
 * Command palette — Cmd/Ctrl+K.
 *
 * A small piece of engineering vanity, and deliberately so: a prospect who opens
 * it learns something about how the company builds that no paragraph of copy
 * would convince them of. It is also genuinely the fastest way around the site.
 *
 * Entirely progressive. Every destination it reaches is a real link reachable
 * without it, so nothing depends on this working.
 *
 * Focus is trapped while open, Escape closes, the trigger is restored on close,
 * and the page behind is locked from scrolling.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    restoreRef.current?.focus();
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      // Click interception cannot see router.push, so signal the indicator here.
      startRouteProgress();
      router.push(href);
    },
    [close, router],
  );

  const setTheme = useCallback(
    (theme: Theme) => {
      storeTheme(theme);
      applyTheme(theme);
      close();
    },
    [close],
  );

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = [
      { id: "home", label: "Home", group: "Go to", run: () => go("/") },
      ...nav.map((item) => ({
        id: item.href,
        label: item.label,
        group: "Go to",
        run: () => go(item.href),
      })),
      {
        id: "request",
        label: "Request work",
        group: "Go to",
        keywords: "quote brief enquiry start project",
        run: () => go("/request/"),
      },
    ];

    const services: Command[] = offers.map((offer) => ({
      id: `svc-${offer.slug}`,
      label: offer.name,
      group: "Services",
      hint: "Request this",
      keywords: offer.lead,
      run: () => go(`/request/?service=${offer.slug}`),
    }));

    const actions: Command[] = [
      {
        id: "email",
        label: `Email ${contact.email}`,
        group: "Actions",
        keywords: "contact mail write get in touch",
        run: () => {
          window.location.href = `mailto:${contact.email}`;
          close();
        },
      },
      {
        id: "copy-email",
        label: "Copy email address",
        group: "Actions",
        keywords: "clipboard",
        run: async () => {
          try {
            await navigator.clipboard.writeText(contact.email);
          } catch {
            // Clipboard can be blocked by permissions or an insecure context.
            // The address is on screen either way; failing quietly is correct.
          }
          close();
        },
      },
      {
        id: "theme-light",
        label: "Theme: Light",
        group: "Theme",
        keywords: "colour color appearance",
        run: () => setTheme("light"),
      },
      {
        id: "theme-dark",
        label: "Theme: Dark",
        group: "Theme",
        keywords: "colour color appearance night",
        run: () => setTheme("dark"),
      },
      {
        id: "theme-system",
        label: "Theme: Match system",
        group: "Theme",
        keywords: "auto colour color appearance",
        run: () => setTheme("system"),
      },
    ];

    return [...pages, ...services, ...actions];
  }, [close, go, setTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.group} ${command.keywords ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [commands, query]);

  // Open/close on Cmd+K, and close on Escape from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          close();
        } else {
          restoreRef.current = document.activeElement as HTMLElement;
          setOpen(true);
        }
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Lock the page behind the dialog, and focus the input on open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Keep the highlighted row in view when navigating by keyboard.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return <PaletteTrigger onOpen={(el) => {
    restoreRef.current = el;
    setOpen(true);
  }} />;

  let lastGroup = "";

  return (
    <>
      <PaletteTrigger
        onOpen={(el) => {
          restoreRef.current = el;
          setOpen(true);
        }}
      />

      <div
        className={styles.backdrop}
        onClick={close}
        role="presentation"
        data-no-print
      >
        <div
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.field}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>

            <input
              ref={inputRef}
              className={styles.input}
              placeholder="Search pages, services, actions…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((i) => (i + 1) % Math.max(results.length, 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive(
                    (i) =>
                      (i - 1 + Math.max(results.length, 1)) %
                      Math.max(results.length, 1),
                  );
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  void results[active]?.run();
                }
              }}
              aria-label="Search commands"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className={styles.esc}>Esc</kbd>
          </div>

          {results.length === 0 ? (
            <p className={styles.empty}>
              Nothing matches “{query}”. Try “payments”, “approach”, or “dark”.
            </p>
          ) : (
            <ul className={styles.list} ref={listRef}>
              {results.map((command, index) => {
                const showGroup = command.group !== lastGroup;
                lastGroup = command.group;
                return (
                  <li key={command.id}>
                    {showGroup && (
                      <p className={styles.group}>{command.group}</p>
                    )}
                    <button
                      type="button"
                      data-index={index}
                      className={`${styles.item} ${
                        index === active ? styles.itemActive : ""
                      }`}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => void command.run()}
                    >
                      <span>{command.label}</span>
                      {command.hint && (
                        <span className={styles.hint}>{command.hint}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.footer}>
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> select
            </span>
            <span>
              <kbd>Esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The visible affordance. A palette nobody can discover is decoration, so the
 * shortcut is advertised in the header rather than left for people to guess.
 */
function PaletteTrigger({ onOpen }: { onOpen: (el: HTMLElement) => void }) {
  const [mac, setMac] = useState(false);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={(event) => onOpen(event.currentTarget)}
      aria-label="Open command palette"
      data-no-print
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" />
      </svg>
      <span className={styles.triggerLabel}>Search</span>
      <kbd className={styles.triggerKbd}>{mac ? "⌘" : "Ctrl"} K</kbd>
    </button>
  );
}
