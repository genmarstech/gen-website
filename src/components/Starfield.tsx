import styles from "./Starfield.module.css";

/**
 * Depth behind the hero.
 *
 * ── THE PROBLEM THIS HAS TO SOLVE ───────────────────────────────────────────
 * This site has a light theme. Stars on a cream ground do not read as stars,
 * they read as dirt on the screen — which is why most starfields quietly assume
 * a dark page and fall apart on a light one.
 *
 * So the field is toned from `--accent` (Ignition, the same in both themes) at
 * low alpha rather than from white. On the dark ground it reads as warm stars;
 * on the cream ground the same marks read as fine atmospheric dust, the way
 * light looks through air. One field, honest in both, rather than one that is
 * switched off in the theme it embarrasses.
 *
 * ── HOW IT READS AS 3D ──────────────────────────────────────────────────────
 * Parallax, which is the only depth cue that actually works without a camera.
 * Three layers, each drifting at a different rate: the far layer barely moves,
 * the near layer moves most. The eye reads differential motion as distance long
 * before it reads size.
 *
 * The layers also differ in size, brightness and blur, so they hold their depth
 * order even standing still under prefers-reduced-motion.
 *
 * ── WHY box-shadow AND NOT NINETY ELEMENTS ──────────────────────────────────
 * Each layer is ONE element carrying its stars as a long box-shadow list. Three
 * DOM nodes instead of ~110, one composited layer each, and the browser paints
 * the whole field in a single pass. The obvious implementation — a span per
 * star — is ninety nodes the layout engine walks on every resize, in a hero
 * that is already animating.
 *
 * ── WHY THE POSITIONS ARE SEEDED, NOT RANDOM ────────────────────────────────
 * A fixed seed. Math.random() would place stars differently on the server and
 * on the client and React would report a hydration mismatch — and in a static
 * export it would also mean the artwork changed on every build, so no diff
 * could ever be reviewed. Same seed, same sky, every time.
 */

/**
 * Mulberry32. A small deterministic PRNG — enough for scattering dots, and it
 * needs no dependency. NOT for anything that needs real randomness.
 */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A box-shadow list scattering `count` points over a 100x100 area, expressed in
 * vmax so the field scales with the viewport instead of pooling in one corner
 * on a wide screen.
 */
function scatter(count: number, seed: number, blur: number): string {
  const rand = seeded(seed);
  const points: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() * 130 - 15).toFixed(2);
    const y = (rand() * 100).toFixed(2);
    // Vary each star's own alpha a little. A field of identically bright dots
    // reads as a texture or a screen defect; an uneven one reads as a sky.
    const alpha = (0.35 + rand() * 0.65).toFixed(2);
    points.push(`${x}vmax ${y}vmax ${blur}px currentColor`.replace("currentColor", `rgb(from var(--accent) r g b / ${alpha})`));
  }
  return points.join(", ");
}

/* Counts tuned by looking at it rather than by taste in the abstract: at
   52/34/18 the field was too sparse to register as a sky once the mask had
   thinned the edges, and read as a few stray specks. */
const FAR = scatter(96, 20260901, 0);
const MID = scatter(58, 77712, 0);
const NEAR = scatter(26, 4242, 1);

export function Starfield() {
  return (
    <div className={styles.field} aria-hidden="true">
      <span className={styles.far} style={{ boxShadow: FAR }} />
      <span className={styles.mid} style={{ boxShadow: MID }} />
      <span className={styles.near} style={{ boxShadow: NEAR }} />

      {/*
        Meteors. Three, with long staggered delays, so one crosses every twenty
        seconds or so rather than a shower — this sits behind a paragraph
        somebody is trying to read, and anything livelier competes with it.
      */}
      <span className={`${styles.meteor} ${styles.meteorOne}`} />
      <span className={`${styles.meteor} ${styles.meteorTwo}`} />
      <span className={`${styles.meteor} ${styles.meteorThree}`} />
    </div>
  );
}
