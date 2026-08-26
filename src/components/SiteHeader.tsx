"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/lib/company";
import { Wordmark } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import styles from "./SiteHeader.module.css";

/**
 * Sticky header.
 *
 * Condenses on scroll, so the mark gets its full presence at the top of the page
 * and stays out of the way afterwards. Below 56rem the links collapse into a
 * disclosure panel rather than wrapping — four links plus a call to action plus
 * a theme control does not fit on a phone, and wrapping it looks like a bug.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes the menu — otherwise it hangs open over the new page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes; the page behind is locked while it is open.
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${condensed ? styles.condensed : ""}`}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Genmars Tech, home">
          <Wordmark
            width={168}
            withTagline={false}
            className={styles.wordmark}
          />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className={styles.desktopNav}>
          <ul className={styles.navList}>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.link} ${active ? styles.active : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.tools}>
          <CommandPalette />
          <ThemeToggle />
          <Link href="/request/" className={styles.cta}>
            Request work
          </Link>

          <button
            type="button"
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`${styles.burgerBar} ${menuOpen ? styles.barTop : ""}`} />
            <span className={`${styles.burgerBar} ${menuOpen ? styles.barMid : ""}`} />
            <span className={`${styles.burgerBar} ${menuOpen ? styles.barBot : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile disclosure panel */}
      <div
        id="site-menu"
        ref={panelRef}
        className={`${styles.panel} ${menuOpen ? styles.panelOpen : ""}`}
        hidden={!menuOpen}
      >
        <nav aria-label="Mobile" className="wrap">
          <ul className={styles.panelList}>
            {nav.map((item, i) => {
              const active = pathname === item.href;
              return (
                <li key={item.href} style={{ ["--i" as string]: i }}>
                  <Link
                    href={item.href}
                    className={`${styles.panelLink} ${active ? styles.active : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li style={{ ["--i" as string]: nav.length }}>
              <Link href="/request/" className={styles.panelCta}>
                Request work
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
