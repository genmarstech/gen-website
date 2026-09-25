import styles from "./WorkImage.module.css";

/**
 * A picture with the credit its licence requires.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE CREDIT IS NOT OPTIONAL AND IS NOT A PROP.
 *
 * Unsplash's licence requires the photographer to be named and linked. This
 * renders nothing at all unless it has both, so there is no arrangement of
 * props that puts one of their photographs on the page uncredited — the
 * component cannot be misused into a breach.
 *
 * The API already refuses to store a URL without a credit (WorkItem.clean),
 * so this is the second of two locks. That is deliberate: the first stops it
 * being saved, this stops it being displayed, and neither depends on somebody
 * remembering the other.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── A PLAIN <img>, NOT next/image ─────────────────────────────────────────
 *
 * next/image wants to optimise, which on `output: "export"` means either a
 * loader at build time or a runtime it does not have. Unsplash already serves
 * resized, CDN-cached images and the URL carries the width we asked for, so
 * the optimisation is done — by them, for free, closer to the visitor.
 *
 * `loading="lazy"` and explicit dimensions because a card grid is mostly
 * below the fold and an image without a size reserves no space, which is what
 * makes a page jump while it loads.
 */
export function WorkImage({
  url,
  alt,
  creditName,
  creditUrl,
  className,
}: {
  url: string;
  alt: string;
  creditName: string;
  creditUrl: string;
  className?: string;
}) {
  if (!url || !creditName || !creditUrl) return null;

  return (
    <figure className={`${styles.figure} ${className ?? ""}`}>
      <img
        className={styles.image}
        src={url}
        /* Empty alt would be wrong here: this is content, not decoration. The
           API refuses to store an image without it, so a blank one means
           something older than that rule — and a description of the project
           is a better fallback than nothing. */
        alt={alt}
        loading="lazy"
        decoding="async"
        width={1080}
        height={720}
      />
      <figcaption className={styles.credit}>
        {/* "Photo by X on Unsplash" is the form their licence asks for, with
            both links carrying the attribution parameters. Built on the
            server when the picture was chosen — see operations/unsplash.py. */}
        Photo by{" "}
        <a href={creditUrl} rel="noopener noreferrer nofollow" target="_blank">
          {creditName}
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/?utm_source=genmars&utm_medium=referral"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          Unsplash
        </a>
      </figcaption>
    </figure>
  );
}
