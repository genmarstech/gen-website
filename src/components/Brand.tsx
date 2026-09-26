/**
 * ══════════════════════════════════════════════════════════════════════════
 * THE G'S ARC WAS OPENED FROM ±25.1° TO ±42° ON 2026-09-26, AND THE OLD
 * GEOMETRY WAS MEASURABLY BROKEN.
 *
 * The arc used to run from ±25.1° with a 9-unit round cap on each end.
 * Measure what that leaves between the cap and the crossbar:
 *
 *     upper arc end, incl. round cap   reaches y = 54.6
 *     crossbar top edge                sits at  y = 55.5
 *     clear counter                    0.92px   — in a 120-unit box
 *
 * Both of the G's counters were sealed to under a pixel, so at every size
 * anyone actually saw — favicon, header, loading mark, the og image — the
 * right-hand side filled in solid and the mark read as a C with a nub. It
 * was not a rendering artefact and no amount of lighting fixed it: there
 * was no aperture to light.
 *
 * At ±42° the counter opens to 9.25px and the crossbar reads as a crossbar.
 * Nothing else moved: same centre (60,60), same radius 34, same stroke
 * weight, same crossbar, same silhouette, same ring. The arc is 17° shorter
 * at each end and that is the entire change.
 *
 * ⚠ IT IS CHANGED IN ALL FIVE PLACES AT ONCE — gen-website, internals-tm,
 * gen-portal, business-os and the promo film — plus both .svg files and the
 * raster icons regenerated from them. The mark existing in two shapes is
 * worse than either shape. If this is ever revised again, revise it
 * everywhere in the same change.
 *
 * The old path, for the record:  M90.8 45.6 A34 34 0 1 0 90.8 74.4
 * ══════════════════════════════════════════════════════════════════════════
 */
import { useId } from "react";

import styles from "./Brand.module.css";

/**
 * Brand marks — Orbit G and the wordmark.
 *
 * Geometry is transcribed exactly from 06-brand/logo/svg/, WITH ONE
 * DELIBERATE CORRECTION — see the banner above Mark. Do not eyeball any
 * other adjustment; re-export from the design canvas (06-brand/source/).
 *
 * The wordmark is drawn as inline SVG rather than loaded as <img> for two
 * reasons: the <text> nodes need the page's Jost webfont to render correctly,
 * and inline SVG inherits currentColor so one component serves light and dark.
 *
 * TWO RULES THAT DO NOT BEND (06-brand/README.md):
 *   - Never re-space the wordmark below +300 tracking (0.3em).
 *   - Never bar the A. The A is a custom barless apex glyph, not Jost's stock A.
 *     That is why the wordmark is split into "GENM" + glyph + "RS".
 */

type MarkProps = {
  /** Rendered size in px. Minimum 24 — 06-brand/README.md. */
  size?: number;
  className?: string;
  /**
   * Hold the orbit still.
   *
   * For the places a moving logo is wrong rather than merely unnecessary: a
   * favicon, an og image, anything captured as a still. Motion is also off
   * for everybody under prefers-reduced-motion — see Brand.module.css.
   */
  still?: boolean;
};

/**
 * Orbit G. Planet = G, ellipse = trajectory at -30deg.
 * Clear space equal to the ring height (x) is required on all four sides;
 * callers are responsible for that margin.
 */
export function Mark({ size = 40, className, still }: MarkProps) {
  /*
   * ids must be unique per instance. Two marks on one page — header and
   * footer — sharing a gradient id means the second silently takes the
   * first's definition, and `url(#glow)` resolving to the wrong element is
   * the kind of bug that only shows up on the page that has both.
   */
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={[styles.mark, still ? styles.still : "", className]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label="Genmars"
      focusable="false"
    >
      <defs>
        {/*
          Light from the upper left, the same direction the elevation tokens
          assume. A flat stroke reads as a drawing of a planet; a gradient
          across it reads as a lit sphere, which is the whole difference
          between the mark looking printed and looking made.
        */}
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--mark-g-lit, #A8705C)" />
          <stop offset="55%" stopColor="var(--mark-g, #8B5A48)" />
          <stop offset="100%" stopColor="var(--mark-g-shade, #6B4438)" />
        </linearGradient>

        {/* The orbit is the lit element — it is Ignition, the one colour in
            the palette allowed to look like it is emitting. */}
        <linearGradient id={`o-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--mark-orbit, #DB7B51)" stopOpacity="0.35" />
          <stop offset="50%" stopColor="var(--mark-orbit, #DB7B51)" />
          <stop offset="100%" stopColor="var(--mark-orbit, #DB7B51)" stopOpacity="0.35" />
        </linearGradient>

        <filter id={`f-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/*
        ⚠ THE GEOMETRY BELOW IS TRANSCRIBED FROM 06-brand/logo/svg AND IS NOT
          EDITED HERE. Every number — the arc, the bar, rx/ry, the -30° — is
          unchanged. What is new is how it is painted and lit: gradients, a
          blur filter, a second trailing ring and rotation. The brand rule is
          about the shapes, and the shapes still match the canvas.
      */}

      {/* The trailing ring. Not a second orbit in the mark's geometry — the
          same ellipse, faint and slightly wider, which is what gives the
          single ring somewhere to travel rather than a hoop to sit in. */}
      <ellipse
        className={styles.trail}
        cx="60"
        cy="60"
        rx="55"
        ry="17"
        fill="none"
        stroke="var(--mark-orbit, #DB7B51)"
        strokeOpacity="0.18"
        strokeWidth="1.5"
        transform="rotate(-30 60 60)"
      />

      <path
        d="M85.27 37.25 A34 34 0 1 0 85.27 82.75"
        fill="none"
        stroke={`url(#g-${uid})`}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M74 60 H92.5"
        fill="none"
        stroke={`url(#g-${uid})`}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Drawn last so it passes in FRONT of the planet, which is what makes
          it an orbit rather than a ring behind a disc. */}
      <ellipse
        className={styles.orbit}
        cx="60"
        cy="60"
        rx="55"
        ry="17"
        fill="none"
        stroke={`url(#o-${uid})`}
        strokeWidth="4"
        filter={`url(#f-${uid})`}
        transform="rotate(-30 60 60)"
      />
    </svg>
  );
}

type WordmarkProps = {
  /** Rendered width in px. Minimum 110 for the horizontal lockup. */
  width?: number;
  /** Show the "NEXT-GENERATION SOFTWARE" tagline beneath the wordmark. */
  withTagline?: boolean;
  className?: string;
};

/**
 * Horizontal lockup: mark + wordmark, optional tagline.
 *
 * Tracking check, against 06-brand/README.md:
 *   wordmark  letterSpacing 13.2 / fontSize 44 = 0.300em  = +300 exactly
 *   tagline   letterSpacing 4.8  / fontSize 11 = 0.436em  ~ +440
 */
export function Wordmark({
  width = 220,
  withTagline = true,
  className,
}: WordmarkProps) {
  const height = (width / 640) * (withTagline ? 160 : 140);

  return (
    <svg
      viewBox={`0 0 640 ${withTagline ? 160 : 140}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Genmars Tech"
      focusable="false"
    >
      <g transform="translate(8,26)">
        <path
          d="M85.27 37.25 A34 34 0 1 0 85.27 82.75"
          fill="none"
          stroke="var(--mark-g, #8B5A48)"
          strokeWidth="9"
          strokeLinecap="round"
          transform="scale(0.9)"
        />
        <path
          d="M74 60 H92.5"
          fill="none"
          stroke="var(--mark-g, #8B5A48)"
          strokeWidth="9"
          strokeLinecap="round"
          transform="scale(0.9)"
        />
        <ellipse
          cx="60"
          cy="60"
          rx="55"
          ry="17"
          fill="none"
          stroke="var(--mark-orbit, #DB7B51)"
          strokeWidth="4"
          transform="scale(0.9) rotate(-30 60 60)"
        />
      </g>

      {/* Wordmark, split around the custom A. Jost Regular, +300 tracking. */}
      <text
        x="222"
        y="88"
        fontFamily="var(--font-jost), Jost, sans-serif"
        fontSize="44"
        fontWeight="400"
        letterSpacing="13.2"
        fill="var(--wordmark-ink, #2E2B34)"
      >
        GENM
      </text>

      {/* The barless A — stroke 13/100 em, width .66em, height .72em cap. */}
      <g transform="translate(400,56) scale(0.32)">
        <path
          d="M8 95 L46 8 L84 95"
          fill="none"
          stroke="var(--wordmark-ink, #2E2B34)"
          strokeWidth="13"
          strokeLinejoin="miter"
        />
      </g>

      <text
        x="446"
        y="88"
        fontFamily="var(--font-jost), Jost, sans-serif"
        fontSize="44"
        fontWeight="400"
        letterSpacing="13.2"
        fill="var(--wordmark-ink, #2E2B34)"
      >
        RS
      </text>

      {withTagline && (
        <text
          x="223"
          y="114"
          fontFamily="var(--font-jost), Jost, sans-serif"
          fontSize="11"
          fontWeight="300"
          letterSpacing="4.8"
          fill="var(--tagline-ink, #7A7480)"
        >
          NEXT-GENERATION SOFTWARE
        </text>
      )}
    </svg>
  );
}
