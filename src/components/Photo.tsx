import media from "@/lib/media.json";
import styles from "./Photo.module.css";

/**
 * A photograph, served at a size the reader's screen can actually use.
 *
 * ── WHY THIS IS NOT next/image ──────────────────────────────────────────────
 *
 * next/image's optimiser needs a running server, and this site is a static
 * export with none — `images: { unoptimized: true }` in next.config.ts means
 * next/image would ship the original file untouched. So the work happens ahead
 * of time in scripts/build-media.mjs, and this renders what that produced.
 *
 * ── THE FOUR THINGS THAT MAKE IT FAST ───────────────────────────────────────
 *
 *   1. Three formats in preference order. AVIF is roughly a third of the JPEG
 *      at the same quality; WebP catches nearly everything else; the <img src>
 *      is a JPEG so a browser that understands neither still gets a picture.
 *
 *   2. A srcset with a real `sizes`. Without `sizes` the browser assumes the
 *      image spans the viewport and picks the largest file — on a phone that
 *      is the whole saving thrown away.
 *
 *   3. Width and height, always. They set an aspect ratio, so the space is
 *      reserved before the bytes arrive and nothing below jumps as it loads.
 *
 *   4. Lazy by default. `priority` opts one image out — use it only for
 *      something visible without scrolling, because a lazy hero is slower than
 *      no lazy loading at all.
 *
 * ── THESE ARE STOCK PHOTOGRAPHS AND MUST NOT PRETEND OTHERWISE ──────────────
 *
 * None of them show people, deliberately: a stock photograph of strangers on
 * this site would be read as our team or our clients, and Charter 04 §IV
 * forbids anything untrue on a Genmars surface. Alt text describes what is in
 * the frame and never claims it is us. They must never appear on /work, which
 * describes real client projects.
 */

type Slug = keyof typeof media;

export function Photo({
  name,
  sizes,
  priority = false,
  className,
  alt,
}: {
  name: Slug;
  /** How wide it renders, so the browser can pick a file. Required on purpose. */
  sizes: string;
  /** Above the fold only. */
  priority?: boolean;
  className?: string;
  /** Overrides the manifest's description where the context needs a different one. */
  alt?: string;
}) {
  const image = media[name];
  const srcset = (variants: { width: number; src: string }[]) =>
    variants.map((v) => `${v.src} ${v.width}w`).join(", ");

  const fallback = image.jpeg.at(-1)?.src ?? "";

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcset(image.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(image.webp)} sizes={sizes} />
      <img
        className={styles.image}
        src={fallback}
        srcSet={srcset(image.jpeg)}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt ?? image.alt}
        loading={priority ? "eager" : "lazy"}
        // Tells the browser it may paint the rest of the page rather than
        // blocking on this decode.
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        // The average colour of the photograph, filling the reserved box until
        // the file lands. A held space in roughly the right colour reads as
        // deliberate; a white hole reads as broken.
        style={{ backgroundColor: image.colour }}
      />
    </picture>
  );
}

/**
 * Where a photograph came from.
 *
 * Neither the Unsplash nor the Pexels licence requires this. It is here
 * because taking somebody's work, using it commercially and saying nothing is
 * the sort of thing that is legal and still not right.
 */
export function photoCredit(name: Slug): string {
  return media[name].credit;
}
