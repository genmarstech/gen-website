"use client";

import { useEffect, useRef } from "react";
import { PlanetCore } from "./PlanetCore";
import styles from "./OrbitSystem.module.css";

/**
 * Orbit Field — the hero's 3D element.
 *
 * WHY CSS 3D AND NOT THREE.JS
 * Charter 03 §I: "A new technology enters the stack only when an existing tool
 * genuinely cannot do the job, and only with a written note explaining why. It
 * is then supported forever, or deliberately removed."
 *
 * A WebGL library would add ~600KB to a marketing page and a permanent
 * dependency to maintain. CSS 3D transforms do this job: real perspective
 * projection, real depth sorting via preserve-3d, GPU-composited, ~2KB, and
 * nothing to patch. For a company whose pitch is that it does not ship things it
 * would not run itself, a hero that loads instantly is the more honest argument.
 *
 * WHAT IT IS
 * The Orbit G, made dimensional. The mark is a planet (the G) with a trajectory
 * ellipse at -30deg; this extends that same geometry into three orbital planes
 * around a lit sphere. One of the planes holds the brand's -30deg exactly.
 *
 * Motion is transform/opacity only — no layout thrash. Everything stops under
 * prefers-reduced-motion, which is honoured both in CSS and by skipping the
 * pointer listener entirely.
 */
export function OrbitSystem() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    // No parallax for reduced-motion users, and none on touch — where there is
    // no cursor to follow, the listener is pure battery cost.
    if (reduced.matches || !fine.matches) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = stage.getBoundingClientRect();
        // -1..1 from the centre of the stage.
        const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        // Small angles. This is a drift, not a toy.
        stage.style.setProperty("--tilt-y", `${clamp(x, -1, 1) * 9}deg`);
        stage.style.setProperty("--tilt-x", `${clamp(-y, -1, 1) * 7}deg`);
      });
    };

    const onLeave = () => {
      stage.style.setProperty("--tilt-y", "0deg");
      stage.style.setProperty("--tilt-x", "0deg");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      aria-hidden="true"
      role="presentation"
    >
      <div className={styles.system}>
        {/* The star that lights the scene, and the warm wash behind it. */}
        <div className={styles.glow} />

        {/*
          Planet — the G of the mark, as a lit body with a system running in it.
          Order matters: the core sits UNDER the terminator so the night side
          dims the wireframe exactly as it dims the surface.
        */}
        <div className={styles.planet}>
          <PlanetCore />
          <div className={styles.planetTerminator} />
          <div className={styles.planetGlint} />
          <div className={styles.planetAtmosphere} />
        </div>

        {/*
          Three orbital planes.
          Plane 2 carries -30deg — the trajectory angle from the brand mark.
        */}
        <div className={`${styles.orbit} ${styles.orbit1}`}>
          <div className={styles.ring} />
          <div className={styles.rotator}>
            <span className={`${styles.satellite} ${styles.sat1}`} />
          </div>
        </div>

        <div className={`${styles.orbit} ${styles.orbit2}`}>
          <div className={styles.ring} />
          <div className={styles.rotator}>
            <span className={`${styles.satellite} ${styles.sat2}`} />
          </div>
        </div>

        <div className={`${styles.orbit} ${styles.orbit3}`}>
          <div className={styles.ring} />
          <div className={styles.rotator}>
            <span className={`${styles.satellite} ${styles.sat3}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
