import { useId } from "react";
import styles from "./PlanetCore.module.css";

/**
 * The system running inside the planet.
 *
 * The hero body was a plain lit sphere. This puts something *in* it: a
 * wireframe globe with service nodes on it, drifting so the sphere reads as
 * rotating rather than sitting still.
 *
 * ── HOW IT READS AS A SPHERE ─────────────────────────────────────────────────
 * Parallels are horizontal ellipses whose half-width follows the circle:
 * rx = sqrt(r² - k²) for a parallel k units above centre. They are static,
 * because on a rotating globe the lines of latitude do not move.
 *
 * Meridians and nodes sit in a group tiled twice and translated by exactly one
 * tile width on a loop, clipped to the sphere. That is a seamless cycle, so the
 * surface appears to turn without any 3D cost.
 *
 * ── WHY NO TEXT ──────────────────────────────────────────────────────────────
 * The obvious version of "software inside" is a little terminal with log lines
 * in it. Every plausible line — a transaction count, a latency figure, a green
 * "deploy succeeded" — is a claim, and Charter 04 §IV forbids putting anything
 * on a Genmars surface that is not true today. Decorative fake telemetry is
 * exactly the sort of thing a prospect would be right to ask about.
 *
 * So the core is abstract: structure and activity, asserting no numbers.
 */
export function PlanetCore() {
  // useId keeps the clipPath unique if this ever renders more than once.
  // Colons are legal in HTML ids but awkward inside url(#…), so strip them.
  const clipId = `gm-core-${useId().replace(/:/g, "")}`;

  /** Parallels: k = distance above/below centre, rx = sqrt(50² − k²). */
  const parallels = [
    { k: -34, rx: 36.7 },
    { k: -18, rx: 46.6 },
    { k: 0, rx: 50 },
    { k: 18, rx: 46.6 },
    { k: 34, rx: 36.7 },
  ];

  /** One tile of surface: meridians plus the nodes that ride with them. */
  const tile = (
    <>
      {[6, 26, 46, 66, 86].map((x, i) => (
        <path
          key={`m-${x}`}
          d={`M ${x} 1 Q ${x + (i % 2 === 0 ? 7 : -7)} 50 ${x} 99`}
          className={styles.meridian}
        />
      ))}

      {/* Service nodes. Staggered pulses — several things, not one thing. */}
      {[
        { cx: 26, cy: 33, r: 1.9, delay: "0s" },
        { cx: 66, cy: 26, r: 1.5, delay: "0.7s" },
        { cx: 46, cy: 58, r: 2.2, delay: "1.4s" },
        { cx: 86, cy: 62, r: 1.6, delay: "2.1s" },
        { cx: 6, cy: 68, r: 1.4, delay: "2.8s" },
      ].map((node) => (
        <circle
          key={`n-${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          className={styles.node}
          style={{ animationDelay: node.delay }}
        />
      ))}

      {/* Traces between nodes — the system talking to itself. */}
      <path d="M 26 33 Q 40 40 46 58" className={styles.trace} />
      <path d="M 66 26 Q 60 44 46 58" className={styles.trace} />
      <path d="M 46 58 Q 68 62 86 62" className={styles.trace} />
    </>
  );

  return (
    <svg
      viewBox="0 0 100 100"
      className={styles.core}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="49.5" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <g className={styles.parallels}>
          {parallels.map((p) => (
            <ellipse
              key={p.k}
              cx="50"
              cy={50 + p.k}
              rx={p.rx}
              ry={p.rx * 0.2}
              className={styles.parallel}
            />
          ))}
        </g>

        {/* Two identical tiles, translated one full width on a loop. */}
        <g className={styles.surface}>
          <g>{tile}</g>
          <g transform="translate(100 0)">{tile}</g>
        </g>
      </g>
    </svg>
  );
}
