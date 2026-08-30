import styles from "./Illustration.module.css";

/**
 * Illustration system.
 *
 * ── WHY THESE ARE DRAWN, NOT SOURCED ────────────────────────────────────────
 * The visual direction came from three reference images filed in
 * 06-brand/references/direction/. They are third-party work — one carries
 * another company's logo, one has the original artist's Pinterest caption in
 * its filename — so they inform the language rather than appear in it.
 *
 * The language they establish:
 *   dark ground · halftone dot texture · wireframe over solid mass ·
 *   fine technical annotation · one chromatic light source
 *
 * Everything here is built from the Orbit G's own geometry in the Genmars
 * palette, which is also why it sits on the page better than the references
 * would have: they are lime, pure black and rainbow chroma against Deep Well
 * and Ignition.
 *
 * ── THE RULE THESE FOLLOW ───────────────────────────────────────────────────
 * Charter 04 §IV — nothing on a Genmars surface may assert something untrue.
 * So the annotations are STRUCTURAL (an angle, a radius, a label for the thing
 * being drawn) and never numeric claims. No transaction counts, no uptime
 * figures, no dashboard mock-ups with invented data. A number that looks like a
 * fact is a fact, and a prospect is entitled to ask about it.
 */

type Props = { className?: string };

/* ── shared primitives ─────────────────────────────────────────────────────── */

function Halftone({ id }: { id: string }) {
  return (
    <>
      <pattern id={`dot-${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="1.2" cy="1.2" r="1" fill="currentColor" />
      </pattern>
      <radialGradient id={`fall-${id}`} cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <mask id={`ht-${id}`}>
        <rect width="400" height="300" fill={`url(#fall-${id})`} />
      </mask>
    </>
  );
}

/* ── 01 · Reconciliation ───────────────────────────────────────────────────── */

/**
 * Two streams of payments arriving out of order, resolving into one ledger.
 *
 * This is the Playbook's sharpest offer drawn literally: the pain is somebody
 * matching M-Pesa against invoices by hand, and the picture is that matching
 * happening on its own.
 */
export function ReconciliationMark({ className }: Props) {
  const id = "rec";
  return (
    <svg
      viewBox="0 0 400 300"
      className={`${styles.svg} ${className ?? ""}`}
      role="img"
      aria-label="Two streams of payments resolving into a single reconciled ledger"
    >
      <defs>
        <Halftone id={id} />
      </defs>

      <g className={styles.halftone}>
        <rect width="400" height="300" fill={`url(#dot-${id})`} mask={`url(#ht-${id})`} />
      </g>

      {/* incoming: irregular, unaligned */}
      {[
        [40, 62, 74], [40, 96, 52], [40, 130, 88], [40, 164, 44], [40, 198, 68],
      ].map(([x, y, w]) => (
        <rect key={`in-${y}`} x={x} y={y} width={w} height="9" rx="1" className={styles.streamA} />
      ))}
      {[
        [150, 78, 46], [150, 112, 62], [150, 146, 38], [150, 180, 56],
      ].map(([x, y, w]) => (
        <rect key={`b-${y}`} x={x} y={y} width={w} height="9" rx="1" className={styles.streamB} />
      ))}

      {/* the resolve: converging traces */}
      {[66, 100, 134, 168, 202].map((y) => (
        <path
          key={`t-${y}`}
          d={`M 236 ${y + 4} C 280 ${y + 4} 280 150 320 150`}
          className={styles.trace}
        />
      ))}

      {/* one reconciled line */}
      <rect x="320" y="140" width="44" height="20" rx="1" className={styles.resolved} />
      <circle cx="342" cy="150" r="30" className={styles.ring} />

      <g className={styles.anno}>
        <path d="M 40 236 H 202" strokeDasharray="2 5" />
        <path d="M 320 236 H 364" strokeDasharray="2 5" />
      </g>
      <g className={styles.annoText}>
        <text x="40" y="252">UNMATCHED</text>
        <text x="320" y="252">RECONCILED</text>
      </g>
    </svg>
  );
}

/* ── 02 · Deployed and monitored ───────────────────────────────────────────── */

/**
 * The Orbit G's body with a monitoring sweep around it.
 *
 * Charter 01 §III — "we deploy, monitor, and maintain what we build. Handing
 * over a repository is not delivery." The sweep is the difference between the
 * two, drawn.
 */
export function MonitoredMark({ className }: Props) {
  const id = "mon";
  return (
    <svg
      viewBox="0 0 400 300"
      className={`${styles.svg} ${className ?? ""}`}
      role="img"
      aria-label="A running system with a monitoring sweep around it"
    >
      <defs>
        <Halftone id={id} />
        <clipPath id={`body-${id}`}>
          <circle cx="200" cy="150" r="72" />
        </clipPath>
      </defs>

      <g className={styles.halftone}>
        <rect width="400" height="300" fill={`url(#dot-${id})`} mask={`url(#ht-${id})`} />
      </g>

      {/* solid mass with a wireframe over it */}
      <circle cx="200" cy="150" r="72" className={styles.mass} />
      <g clipPath={`url(#body-${id})`}>
        {[-48, -24, 0, 24, 48].map((k) => (
          <ellipse
            key={k}
            cx="200"
            cy={150 + k}
            rx={Math.round(Math.sqrt(72 * 72 - k * k))}
            ry={Math.round(Math.sqrt(72 * 72 - k * k) * 0.22)}
            className={styles.wire}
          />
        ))}
        {[-56, -28, 0, 28, 56].map((x) => (
          <path
            key={x}
            d={`M ${200 + x} 78 Q ${200 + x * 1.5} 150 ${200 + x} 222`}
            className={styles.wire}
          />
        ))}
      </g>
      <circle cx="200" cy="150" r="72" className={styles.rim} />

      {/* the monitoring sweep — the mark's own −30° trajectory */}
      <ellipse
        cx="200" cy="150" rx="150" ry="46"
        transform="rotate(-30 200 150)"
        className={styles.orbitTrack}
      />
      <ellipse
        cx="200" cy="150" rx="150" ry="46"
        transform="rotate(-30 200 150)"
        className={styles.orbitSweep}
      />

      <g className={styles.anno}>
        <path d="M 200 62 V 34" />
        <circle cx="200" cy="62" r="2.5" />
      </g>
      <g className={styles.annoText}>
        <text x="200" y="26" textAnchor="middle">MONITORED</text>
      </g>
    </svg>
  );
}

/* ── 03 · The gates ────────────────────────────────────────────────────────── */

/**
 * Charter 03 §IV's three security tiers as concentric orbits.
 *
 * Tier 1 is drawn solid because it is the one that is actually met; the outer
 * two are dashed because they are gates ahead, not claims. That distinction is
 * the whole point of the drawing — it would be easy and dishonest to render all
 * three the same.
 */
export function GatesMark({ className }: Props) {
  const id = "gate";
  return (
    <svg
      viewBox="0 0 400 300"
      className={`${styles.svg} ${className ?? ""}`}
      role="img"
      aria-label="Three concentric security gates, the innermost one met"
    >
      <defs>
        <Halftone id={id} />
      </defs>

      <g className={styles.halftone}>
        <rect width="400" height="300" fill={`url(#dot-${id})`} mask={`url(#ht-${id})`} />
      </g>

      <circle cx="200" cy="150" r="30" className={styles.core} />

      <ellipse cx="200" cy="150" rx="78" ry="26" transform="rotate(-30 200 150)" className={styles.gateMet} />
      <ellipse cx="200" cy="150" rx="118" ry="38" transform="rotate(-30 200 150)" className={styles.gateAhead} />
      <ellipse cx="200" cy="150" rx="158" ry="50" transform="rotate(-30 200 150)" className={styles.gateAhead} />

      <g className={styles.annoText}>
        <text x="200" y="106" textAnchor="middle">TIER 1</text>
        <text x="200" y="72" textAnchor="middle" className={styles.annoFaint}>TIER 2</text>
        <text x="200" y="38" textAnchor="middle" className={styles.annoFaint}>TIER 3</text>
      </g>
    </svg>
  );
}
